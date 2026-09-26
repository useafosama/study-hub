"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { SubjectSchema } from "@/lib/validation/schemas";
import { logActivity } from "@/lib/activity/log";
import { Subject } from "@/types/database";

export async function getAdminSubjects(): Promise<Subject[]> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: subjects, error } = await supabase
    .from("subjects")
    .select(`
      id,
      name,
      code,
      description,
      image_url,
      is_published,
      sort_order,
      created_at,
      updated_at,
      contents (id)
    `)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch subjects:", error);
    return [];
  }

  return subjects.map((s: any) => ({
    ...s,
    total_contents: (s.contents || []).length,
  }));
}

export async function createSubjectAction(formData: FormData) {
  const adminSession = await requireAdmin();
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const description = (formData.get("description") as string) || null;
  const image_url = (formData.get("image_url") as string) || null;
  const is_published = formData.get("is_published") === "true";
  const sort_order = parseInt((formData.get("sort_order") as string) || "0", 10);

  const validation = SubjectSchema.safeParse({
    name,
    code,
    description,
    image_url,
    is_published,
    sort_order,
  });

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "بيانات المادة غير صالحة" };
  }

  const { data, error } = await supabase
    .from("subjects")
    .insert({
      name,
      code,
      description,
      image_url,
      is_published,
      sort_order,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "رمز المادة (Code) مستخدم بالفعل، يرجى اختيار رمز آخر" };
    }
    return { error: `فشل إنشاء المادة: ${error.message}` };
  }

  await logActivity({
    userId: adminSession.profile.id,
    action: "create_subject",
    entityType: "subject",
    entityId: data.id,
    metadata: { name, code, is_published },
  });

  revalidatePath("/admin/subjects");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: true, message: "تم إنشاء المادة بنجاح" };
}

export async function updateSubjectAction(formData: FormData) {
  const adminSession = await requireAdmin();
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const description = (formData.get("description") as string) || null;
  const image_url = (formData.get("image_url") as string) || null;
  const is_published = formData.get("is_published") === "true";
  const sort_order = parseInt((formData.get("sort_order") as string) || "0", 10);

  const validation = SubjectSchema.safeParse({
    id,
    name,
    code,
    description,
    image_url,
    is_published,
    sort_order,
  });

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "بيانات المادة غير صالحة" };
  }

  const { error } = await supabase
    .from("subjects")
    .update({
      name,
      code,
      description,
      image_url,
      is_published,
      sort_order,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "رمز المادة (Code) مستخدم بالفعل، يرجى اختيار رمز آخر" };
    }
    return { error: `فشل تحديث المادة: ${error.message}` };
  }

  await logActivity({
    userId: adminSession.profile.id,
    action: "update_subject",
    entityType: "subject",
    entityId: id,
    metadata: { name, code, is_published },
  });

  revalidatePath("/admin/subjects");
  revalidatePath(`/admin/subjects/${id}/content`);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath(`/subjects/${id}`);
  return { success: true, message: "تم تحديث بيانات المادة بنجاح" };
}

export async function toggleSubjectPublishAction(id: string, currentStatus: boolean) {
  const adminSession = await requireAdmin();
  const supabase = await createClient();

  const newStatus = !currentStatus;
  const { error } = await supabase
    .from("subjects")
    .update({ is_published: newStatus })
    .eq("id", id);

  if (error) {
    return { error: "فشل تغيير حالة نشر المادة: " + error.message };
  }

  await logActivity({
    userId: adminSession.profile.id,
    action: newStatus ? "publish_subject" : "hide_subject",
    entityType: "subject",
    entityId: id,
  });

  revalidatePath("/admin/subjects");
  revalidatePath("/dashboard");
  return { success: true, message: newStatus ? "تم نشر المادة للطلاب" : "تم إخفاء المادة" };
}

export async function deleteSubjectAction(id: string) {
  const adminSession = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("subjects").delete().eq("id", id);

  if (error) {
    return { error: "فشل حذف المادة: " + error.message };
  }

  await logActivity({
    userId: adminSession.profile.id,
    action: "delete_subject",
    entityType: "subject",
    entityId: id,
  });

  revalidatePath("/admin/subjects");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: true, message: "تم حذف المادة وجميع محتوياتها بنجاح" };
}

export async function reorderSubjectsAction(orderedIds: string[]) {
  const adminSession = await requireAdmin();
  const supabase = await createClient();

  const updates = orderedIds.map((id, index) =>
    supabase.from("subjects").update({ sort_order: index }).eq("id", id)
  );

  await Promise.all(updates);

  await logActivity({
    userId: adminSession.profile.id,
    action: "reorder_subjects",
    entityType: "subject",
    metadata: { count: orderedIds.length },
  });

  revalidatePath("/admin/subjects");
  revalidatePath("/dashboard");
  return { success: true, message: "تم حفظ الترتيب بنجاح" };
}
