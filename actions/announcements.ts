"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireAdmin } from "@/lib/auth/session";
import { AnnouncementSchema } from "@/lib/validation/schemas";
import { logActivity } from "@/lib/activity/log";
import {
  Announcement,
  DetailedAnnouncement,
  AnnouncementMeta,
  AnnouncementType,
  AnnouncementPriority,
  AnnouncementAudience,
} from "@/types/database";
import {
  encodeAnnouncementContent,
  parseAnnouncementContent,
} from "@/lib/announcements";

/**
 * Admin: Get all announcements (published, drafts, expired) with parsed metadata.
 */
export async function getAdminAnnouncements(): Promise<DetailedAnnouncement[]> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: announcements, error } = await supabase
    .from("announcements")
    .select(`
      id,
      title,
      content,
      target_type,
      subject_id,
      is_published,
      created_at,
      expires_at,
      subjects (
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch admin announcements:", error);
    return [];
  }

  const now = new Date();

  return announcements.map((a: any) => {
    const { cleanContent, meta } = parseAnnouncementContent(a.content, a.subject_id);
    const isExpired = Boolean(a.expires_at && new Date(a.expires_at) < now);

    const subName = (a.subjects as any)?.name || (Array.isArray(a.subjects) ? (a.subjects as any)[0]?.name : null) || null;
    return {
      id: a.id,
      title: a.title,
      content: a.content,
      clean_content: cleanContent,
      target_type: a.target_type,
      subject_id: a.subject_id,
      subject_name: subName,
      is_published: a.is_published,
      created_at: a.created_at,
      expires_at: a.expires_at,
      type: meta.type,
      priority: meta.priority,
      author_name: meta.author_name || "إدارة المنصة",
      target_audience: meta.target_audience,
      target_student_ids: meta.target_student_ids,
      is_expired: isExpired,
    };
  });
}

export interface StudentAnnouncementsResponse {
  announcements: DetailedAnnouncement[];
  unreadCount: number;
}

/**
 * Student: Get announcements targeted to the student, excluding expired ones,
 * with per-student read status.
 */
export async function getStudentAnnouncements(): Promise<StudentAnnouncementsResponse> {
  const session = await requireAuth();
  const supabase = await createClient();
  const userId = session.profile.id;

  // 1. Fetch student's assigned subjects
  const { data: userSubjects } = await supabase
    .from("user_subjects")
    .select("subject_id")
    .eq("user_id", userId);

  const assignedSubjectIds = new Set<string>((userSubjects || []).map((us) => us.subject_id));

  // 2. Fetch student's read announcements from activity_logs
  const readAnnouncementIds = new Set<string>();
  try {
    const { data: readLogs } = await supabase
      .from("activity_logs")
      .select("entity_id")
      .eq("user_id", userId)
      .eq("action", "read_announcement");

    if (readLogs) {
      for (const log of readLogs) {
        if (log.entity_id) {
          readAnnouncementIds.add(log.entity_id);
        }
      }
    }
  } catch (e) {
    console.debug("Failed to read announcement logs", e);
  }

  // 3. Fetch published announcements
  const { data: announcements, error } = await supabase
    .from("announcements")
    .select(`
      id,
      title,
      content,
      target_type,
      subject_id,
      is_published,
      created_at,
      expires_at,
      subjects (
        name
      )
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error || !announcements) {
    console.error("Failed to fetch student announcements:", error);
    return { announcements: [], unreadCount: 0 };
  }

  const now = new Date();
  const detailedList: DetailedAnnouncement[] = [];

  for (const a of announcements) {
    // 4. Automatically filter out expired announcements for students
    if (a.expires_at && new Date(a.expires_at) < now) {
      continue;
    }

    const { cleanContent, meta } = parseAnnouncementContent(a.content, a.subject_id);

    // 5. Audience targeting security check
    let isTargeted = false;
    if (meta.target_audience === "all") {
      isTargeted = true;
    } else if (meta.target_audience === "subject") {
      isTargeted = Boolean(a.subject_id && assignedSubjectIds.has(a.subject_id));
    } else if (meta.target_audience === "students") {
      isTargeted = Boolean(
        meta.target_student_ids && meta.target_student_ids.includes(userId)
      );
    } else {
      // Legacy fallback
      isTargeted =
        a.target_type === "all" ||
        (a.target_type === "subject" && a.subject_id && assignedSubjectIds.has(a.subject_id));
    }

    if (!isTargeted) {
      continue;
    }

    const isRead = readAnnouncementIds.has(a.id);

    const subName = (a.subjects as any)?.name || (Array.isArray(a.subjects) ? (a.subjects as any)[0]?.name : null) || null;

    detailedList.push({
      id: a.id,
      title: a.title,
      content: a.content,
      clean_content: cleanContent,
      target_type: a.target_type,
      subject_id: a.subject_id,
      subject_name: subName,
      is_published: a.is_published,
      created_at: a.created_at,
      expires_at: a.expires_at,
      type: meta.type,
      priority: meta.priority,
      author_name: meta.author_name || "إدارة المنصة",
      target_audience: meta.target_audience,
      target_student_ids: meta.target_student_ids,
      is_read: isRead,
      is_expired: false,
    });
  }

  const unreadCount = detailedList.filter((a) => !a.is_read).length;

  return {
    announcements: detailedList,
    unreadCount,
  };
}

/**
 * Admin: Create an announcement with rich metadata and audience targeting.
 */
export async function createAnnouncementAction(formData: FormData) {
  const adminSession = await requireAdmin();
  const supabase = await createClient();

  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const type = (formData.get("type") as AnnouncementType) || "general";
  const priority = (formData.get("priority") as AnnouncementPriority) || "normal";
  const target_audience = (formData.get("target_audience") as AnnouncementAudience) || "all";
  const subject_id = (formData.get("subject_id") as string) || null;
  const is_published = formData.get("is_published") === "true";
  const expires_at = (formData.get("expires_at") as string) || null;
  const author_name =
    (formData.get("author_name") as string)?.trim() ||
    adminSession.profile.full_name ||
    "إدارة المنصة";

  // Parse student IDs if specific students selected
  const rawStudentIds = formData.get("target_student_ids") as string;
  let target_student_ids: string[] = [];
  if (rawStudentIds) {
    try {
      target_student_ids = JSON.parse(rawStudentIds);
    } catch {
      target_student_ids = rawStudentIds.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  const meta: AnnouncementMeta = {
    type,
    priority,
    author_name,
    target_audience,
    target_student_ids,
  };

  const encodedContent = encodeAnnouncementContent(content, meta);

  // In Postgres DB schema, target_type check constraint is IN ('all', 'subject')
  const dbTargetType = target_audience === "subject" && subject_id ? "subject" : "all";
  const dbSubjectId = target_audience === "subject" ? subject_id : null;

  const validation = AnnouncementSchema.safeParse({
    title,
    content: encodedContent,
    target_type: dbTargetType,
    subject_id: dbSubjectId,
    is_published,
    expires_at,
    type,
    priority,
    target_audience,
    target_student_ids,
    author_name,
  });

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "بيانات الإعلان غير صالحة" };
  }

  const { data, error } = await supabase
    .from("announcements")
    .insert({
      title,
      content: encodedContent,
      target_type: dbTargetType,
      subject_id: dbSubjectId,
      is_published,
      expires_at: expires_at ? new Date(expires_at).toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: `فشل إنشاء الإعلان: ${error.message}` };
  }

  await logActivity({
    userId: adminSession.profile.id,
    action: "create_announcement",
    entityType: "announcement",
    entityId: data.id,
    metadata: {
      title,
      type,
      priority,
      target_audience,
      subject_id: dbSubjectId,
      target_student_ids_count: target_student_ids.length,
    },
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  revalidatePath("/dashboard");
  revalidatePath("/notifications");

  return { success: true, message: "تم نشر الإعلان بنجاح" };
}

/**
 * Admin: Update an existing announcement.
 */
export async function updateAnnouncementAction(formData: FormData) {
  const adminSession = await requireAdmin();
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const type = (formData.get("type") as AnnouncementType) || "general";
  const priority = (formData.get("priority") as AnnouncementPriority) || "normal";
  const target_audience = (formData.get("target_audience") as AnnouncementAudience) || "all";
  const subject_id = (formData.get("subject_id") as string) || null;
  const is_published = formData.get("is_published") === "true";
  const expires_at = (formData.get("expires_at") as string) || null;
  const author_name =
    (formData.get("author_name") as string)?.trim() ||
    adminSession.profile.full_name ||
    "إدارة المنصة";

  const rawStudentIds = formData.get("target_student_ids") as string;
  let target_student_ids: string[] = [];
  if (rawStudentIds) {
    try {
      target_student_ids = JSON.parse(rawStudentIds);
    } catch {
      target_student_ids = rawStudentIds.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  const meta: AnnouncementMeta = {
    type,
    priority,
    author_name,
    target_audience,
    target_student_ids,
  };

  const encodedContent = encodeAnnouncementContent(content, meta);
  const dbTargetType = target_audience === "subject" && subject_id ? "subject" : "all";
  const dbSubjectId = target_audience === "subject" ? subject_id : null;

  const validation = AnnouncementSchema.safeParse({
    id,
    title,
    content: encodedContent,
    target_type: dbTargetType,
    subject_id: dbSubjectId,
    is_published,
    expires_at,
    type,
    priority,
    target_audience,
    target_student_ids,
    author_name,
  });

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "بيانات الإعلان غير صالحة" };
  }

  const { error } = await supabase
    .from("announcements")
    .update({
      title,
      content: encodedContent,
      target_type: dbTargetType,
      subject_id: dbSubjectId,
      is_published,
      expires_at: expires_at ? new Date(expires_at).toISOString() : null,
    })
    .eq("id", id);

  if (error) {
    return { error: `فشل تحديث الإعلان: ${error.message}` };
  }

  await logActivity({
    userId: adminSession.profile.id,
    action: "update_announcement",
    entityType: "announcement",
    entityId: id,
    metadata: { title, type, priority, target_audience },
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  revalidatePath("/dashboard");
  revalidatePath("/notifications");

  return { success: true, message: "تم تحديث الإعلان بنجاح" };
}

/**
 * Admin: Delete an announcement.
 */
export async function deleteAnnouncementAction(id: string) {
  const adminSession = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("announcements").delete().eq("id", id);

  if (error) {
    return { error: "فشل حذف الإعلان: " + error.message };
  }

  await logActivity({
    userId: adminSession.profile.id,
    action: "delete_announcement",
    entityType: "announcement",
    entityId: id,
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  revalidatePath("/dashboard");
  revalidatePath("/notifications");

  return { success: true, message: "تم حذف الإعلان بنجاح" };
}

/**
 * Admin: Toggle publication state (publish / unpublish).
 */
export async function toggleAnnouncementPublishAction(id: string, currentStatus: boolean) {
  await requireAdmin();
  const supabase = await createClient();

  const newStatus = !currentStatus;
  const { error } = await supabase
    .from("announcements")
    .update({ is_published: newStatus })
    .eq("id", id);

  if (error) {
    return { error: "فشل تغيير حالة الإعلان: " + error.message };
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  revalidatePath("/dashboard");
  revalidatePath("/notifications");

  return { success: true, message: newStatus ? "تم نشر الإعلان" : "تم تحويل الإعلان لمسودة" };
}

/**
 * Student: Mark a single announcement as read.
 */
export async function markAnnouncementAsReadAction(announcementId: string) {
  const session = await requireAuth();
  const supabase = await createClient();
  const userId = session.profile.id;

  try {
    // Check if already logged to prevent duplicates
    const { data: existing } = await supabase
      .from("activity_logs")
      .select("id")
      .eq("user_id", userId)
      .eq("action", "read_announcement")
      .eq("entity_id", announcementId)
      .limit(1);

    if (!existing || existing.length === 0) {
      await supabase.from("activity_logs").insert({
        user_id: userId,
        action: "read_announcement",
        entity_type: "announcement",
        entity_id: announcementId,
        metadata: { read_at: new Date().toISOString() },
      });
    }
  } catch (e) {
    console.debug("markAnnouncementAsRead log skipped", e);
  }

  revalidatePath("/announcements");
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Student: Mark all announcements as read.
 */
export async function markAllAnnouncementsAsReadAction(announcementIds: string[]) {
  const session = await requireAuth();
  const supabase = await createClient();
  const userId = session.profile.id;

  if (!announcementIds || announcementIds.length === 0) {
    return { success: true };
  }

  try {
    // Get currently read IDs to avoid duplicate insertions
    const { data: existing } = await supabase
      .from("activity_logs")
      .select("entity_id")
      .eq("user_id", userId)
      .eq("action", "read_announcement");

    const alreadyReadIds = new Set((existing || []).map((e) => e.entity_id));
    const toInsert = announcementIds
      .filter((id) => !alreadyReadIds.has(id))
      .map((id) => ({
        user_id: userId,
        action: "read_announcement",
        entity_type: "announcement",
        entity_id: id,
        metadata: { read_at: new Date().toISOString() },
      }));

    if (toInsert.length > 0) {
      await supabase.from("activity_logs").insert(toInsert);
    }
  } catch (e) {
    console.debug("markAllAnnouncementsAsRead logs skipped", e);
  }

  revalidatePath("/announcements");
  revalidatePath("/dashboard");
  return { success: true };
}
