"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireAdmin } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity/log";
import { parseAnnouncementContent } from "@/lib/announcements";
import {
  NotificationItem,
  NotificationPreferences,
  NotificationType,
} from "@/types/database";

export interface StudentNotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
  preferences: NotificationPreferences;
}

export async function getStudentNotifications(): Promise<StudentNotificationsResponse> {
  const session = await requireAuth();
  const supabase = await createClient();
  const userId = session.profile.id;

  const notifications: NotificationItem[] = [];
  const readNotificationIds = new Set<string>();

  // Default preferences
  let preferences: NotificationPreferences = {
    new_lectures: true,
    new_resources: true,
    announcements: true,
    quiz_notifications: true,
    study_reminders: true,
    progress_milestones: true,
  };

  // 1. Get user notification preferences
  try {
    const { data: prefData } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (prefData) {
      preferences = {
        new_lectures: prefData.new_lectures ?? true,
        new_resources: prefData.new_resources ?? true,
        announcements: prefData.announcements ?? true,
        quiz_notifications: prefData.quiz_notifications ?? true,
        study_reminders: prefData.study_reminders ?? true,
        progress_milestones: prefData.progress_milestones ?? true,
      };
    }
  } catch (e) {
    console.debug("Notification preferences query skipped or pending migration", e);
  }

  // 2. Get user's read states from notification_reads table
  try {
    const { data: reads } = await supabase
      .from("notification_reads")
      .select("notification_id")
      .eq("user_id", userId);

    if (reads) {
      reads.forEach((r) => readNotificationIds.add(r.notification_id));
    }
  } catch (e) {
    console.debug("Notification reads query skipped or pending migration", e);
  }

  // 3. Query direct notifications from notifications table
  try {
    const { data: directNotifications } = await supabase
      .from("notifications")
      .select("*")
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(50);

    if (directNotifications) {
      for (const item of directNotifications) {
        notifications.push({
          id: item.id,
          userId: item.user_id,
          subjectId: item.subject_id,
          type: item.type as NotificationType,
          title: item.title,
          message: item.message,
          link: item.link || null,
          read: readNotificationIds.has(item.id),
          createdAt: item.created_at,
        });
      }
    }
  } catch (e) {
    console.debug("Direct notifications query skipped or pending migration", e);
  }

  // 4. Query assigned subjects for this student
  const { data: userSubjects } = await supabase
    .from("user_subjects")
    .select("subject_id, subjects(id, name, code, is_published)")
    .eq("user_id", userId);

  const assignedSubjectIds: string[] = [];
  const subjectsMap = new Map<string, any>();

  if (userSubjects) {
    for (const item of userSubjects) {
      const sub = (item as any).subjects;
      if (sub && sub.is_published) {
        assignedSubjectIds.push(sub.id);
        subjectsMap.set(sub.id, sub);
      }
    }
  }

  // 5. Seamless integration with existing Announcements
  if (preferences.announcements) {
    try {
      let query = supabase
        .from("announcements")
        .select("id, title, content, target_type, subject_id, created_at, subjects(name)")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(20);

      const { data: announcements } = await query;

      if (announcements) {
        for (const a of announcements) {
          const { cleanContent, meta } = parseAnnouncementContent(a.content, a.subject_id);

          // Check targeting
          let isTargeted = false;
          if (meta.target_audience === "all") {
            isTargeted = true;
          } else if (meta.target_audience === "subject") {
            isTargeted = Boolean(a.subject_id && assignedSubjectIds.includes(a.subject_id));
          } else if (meta.target_audience === "students") {
            isTargeted = Boolean(meta.target_student_ids && meta.target_student_ids.includes(userId));
          } else {
            isTargeted =
              a.target_type === "all" ||
              (a.target_type === "subject" && a.subject_id && assignedSubjectIds.includes(a.subject_id));
          }

          if (isTargeted) {
            const notifId = `ann_${a.id}`;
            const subName = (a as any).subjects?.name;
            notifications.push({
              id: notifId,
              subjectId: a.subject_id,
              type: "announcement",
              title: a.title,
              message: subName ? `إعلان خاص بمادة ${subName}: ${cleanContent}` : cleanContent,
              link: `/announcements?id=${a.id}`,
              read: readNotificationIds.has(notifId),
              createdAt: a.created_at,
            });
          }
        }
      }
    } catch (e) {
      console.debug("Announcements query error:", e);
    }
  }

  // 6. Seamless integration with Recently Published Lectures & Exams
  if (assignedSubjectIds.length > 0 && (preferences.new_lectures || preferences.quiz_notifications)) {
    try {
      const { data: recentContents } = await supabase
        .from("contents")
        .select("id, subject_id, type, title, created_at, subjects(name, code)")
        .in("subject_id", assignedSubjectIds)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(15);

      if (recentContents) {
        for (const c of recentContents) {
          const isExam = c.type === "exam";
          if (isExam && !preferences.quiz_notifications) continue;
          if (!isExam && !preferences.new_lectures) continue;

          const notifId = `content_${c.id}`;
          const subName = (c as any).subjects?.name || "المادة";
          const typeLabel =
            c.type === "exam" ? "امتحان جديد" : c.type === "section" ? "سكشن جديد" : "محاضرة جديدة";

          notifications.push({
            id: notifId,
            subjectId: c.subject_id,
            type: isExam ? "new_quiz" : "new_lecture",
            title: `${typeLabel}: ${c.title}`,
            message: `تمت إضافة ${typeLabel} في مادة ${subName}. يمكنك البدء في المشاهدة والمذاكرة الآن.`,
            link: `/content/${c.id}`,
            read: readNotificationIds.has(notifId),
            createdAt: c.created_at,
          });
        }
      }
    } catch (e) {
      console.debug("Contents query error:", e);
    }
  }

  // Sort all notifications descending by creation date
  notifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    preferences,
  };
}

export async function markNotificationAsReadAction(notificationId: string) {
  const session = await requireAuth();
  const supabase = await createClient();
  const userId = session.profile.id;

  try {
    await supabase.from("notification_reads").upsert(
      {
        user_id: userId,
        notification_id: notificationId,
        read_at: new Date().toISOString(),
      },
      { onConflict: "user_id, notification_id" }
    );
  } catch (e) {
    console.debug("Mark notification read DB write skipped or pending migration", e);
  }

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function markAllNotificationsAsReadAction(notificationIds: string[]) {
  const session = await requireAuth();
  const supabase = await createClient();
  const userId = session.profile.id;

  if (!notificationIds || notificationIds.length === 0) {
    return { success: true };
  }

  try {
    const rows = notificationIds.map((id) => ({
      user_id: userId,
      notification_id: id,
      read_at: new Date().toISOString(),
    }));

    await supabase.from("notification_reads").upsert(rows, {
      onConflict: "user_id, notification_id",
    });
  } catch (e) {
    console.debug("Mark all notifications read DB write skipped", e);
  }

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function saveNotificationPreferencesAction(
  preferences: NotificationPreferences
) {
  const session = await requireAuth();
  const supabase = await createClient();
  const userId = session.profile.id;

  try {
    await supabase.from("notification_preferences").upsert(
      {
        user_id: userId,
        new_lectures: preferences.new_lectures,
        new_resources: preferences.new_resources,
        announcements: preferences.announcements,
        quiz_notifications: preferences.quiz_notifications,
        study_reminders: preferences.study_reminders,
        progress_milestones: preferences.progress_milestones,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch (e) {
    console.debug("Save preferences DB write skipped", e);
  }

  revalidatePath("/notifications");
  return { success: true };
}

export interface CreateAdminNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  targetType: "all" | "subject" | "user";
  targetId?: string | null; // subject_id or user_id
}

export async function createAdminNotificationAction(
  params: CreateAdminNotificationParams
) {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const userId = params.targetType === "user" ? params.targetId : null;
  const subjectId = params.targetType === "subject" ? params.targetId : null;

  try {
    await supabase.from("notifications").insert({
      user_id: userId,
      subject_id: subjectId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link || null,
    });
  } catch (e) {
    console.debug("Admin notification DB insert skipped or pending migration", e);
  }

  // Log admin activity
  await logActivity({
    userId: admin.profile.id,
    action: "create_notification",
    entityType: "notification",
    metadata: {
      type: params.type,
      title: params.title,
      targetType: params.targetType,
      targetId: params.targetId,
    },
  });

  revalidatePath("/notifications");
  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
  return { success: true };
}
