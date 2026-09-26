"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { AnnouncementSchema } from "@/lib/validation/schemas";
import { logActivity } from "@/lib/activity/log";
import { Announcement } from "@/types/database";

export async function getAdminAnnouncements(): Promise<Announcement[]> {
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
    console.error("Failed to fetch announcements:", error);
    return [];
  }

  return announcements.map((a: any) => ({
    ...a,
    subject_name: a.subjects?.name || null,
  })) as Announcement[];
}

export async function createAnnouncementAction(formData: FormData) {
  const adminSession = await requireAdmin();
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const target_type = (formData.get("target_type") as string) || "all";
  const subject_id = (formData.get("subject_id") as string) || null;
  const is_published = formData.get("is_published") === "true";
  const expires_at = (formData.get("expires_at") as string) || null;

  const validation = AnnouncementSchema.safeParse({
    title,
    content,
    target_type,
    subject_id: target_type === "subject" ? subject_id : null,
    is_published,
    expires_at,
  });

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "بيانات الإعلان غير صالحة" };
  }

  const { data, error } = await supabase
    .from("announcements")
    .insert({
      title,
      content,
      target_type,
      subject_id: target_type === "subject" ? subject_id : null,
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
    metadata: { title, target_type, subject_id },
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
  revalidatePath("/announcements");
  return { success: true, message: "تم نشر الإعلان بنجاح" };
}

export async function updateAnnouncementAction(formData: FormData) {
  const adminSession = await requireAdmin();
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const target_type = (formData.get("target_type") as string) || "all";
  const subject_id = (formData.get("subject_id") as string) || null;
  const is_published = formData.get("is_published") === "true";
  const expires_at = (formData.get("expires_at") as string) || null;

  const validation = AnnouncementSchema.safeParse({
    id,
    title,
    content,
    target_type,
    subject_id: target_type === "subject" ? subject_id : null,
    is_published,
    expires_at,
  });

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "بيانات الإعلان غير صالحة" };
  }

  const { error } = await supabase
    .from("announcements")
    .update({
      title,
      content,
      target_type,
      subject_id: target_type === "subject" ? subject_id : null,
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
    metadata: { title, target_type },
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
  revalidatePath("/announcements");
  return { success: true, message: "تم تحديث الإعلان بنجاح" };
}

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
  revalidatePath("/dashboard");
  revalidatePath("/announcements");
  return { success: true, message: "تم حذف الإعلان بنجاح" };
}

export async function toggleAnnouncementPublishAction(id: string, currentStatus: boolean) {
  const adminSession = await requireAdmin();
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
  revalidatePath("/dashboard");
  return { success: true, message: newStatus ? "تم نشر الإعلان" : "تم إخفاء الإعلان" };
}
