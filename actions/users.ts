"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { usernameToInternalEmail } from "@/lib/auth/utils";
import { CreateUserSchema, UpdateUserSchema } from "@/lib/validation/schemas";
import { logActivity } from "@/lib/activity/log";

export async function getUsersList() {
  await requireAdmin();
  const supabase = await createClient();

  // Fetch all profiles
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      username,
      avatar_url,
      role,
      is_active,
      created_at,
      updated_at,
      last_login_at,
      user_subjects (
        subject_id,
        subjects (
          id,
          name,
          code
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }

  return profiles.map((p: any) => ({
    ...p,
    assigned_subjects: (p.user_subjects || [])
      .map((us: any) => us.subjects)
      .filter(Boolean),
  }));
}

export async function createUserAction(formData: FormData) {
  const adminSession = await requireAdmin();

  const full_name = formData.get("full_name") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "student";
  const is_active = formData.get("is_active") === "true";
  const subjectIdsRaw = formData.getAll("subject_ids") as string[];

  const validation = CreateUserSchema.safeParse({
    full_name,
    username,
    password,
    role,
    is_active,
    subject_ids: subjectIdsRaw,
  });

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "بيانات المستخدم غير صالحة" };
  }

  const adminClient = createAdminClient();
  const internalEmail = usernameToInternalEmail(username);

  // 1. Create Supabase Auth user
  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email: internalEmail,
    password: password,
    email_confirm: true,
    user_metadata: {
      full_name,
      username,
      role,
    },
  });

  if (authError || !authUser.user) {
    if (authError?.message?.includes("already registered") || authError?.message?.includes("unique")) {
      return { error: "اسم المستخدم هذا مسجل مسبقاً، يرجى اختيار اسم مستخدم آخر" };
    }
    return { error: `فشل إنشاء الحساب: ${authError?.message || "خطأ غير معروف"}` };
  }

  const userId = authUser.user.id;

  // 2. Insert Profile record
  const supabase = await createClient();
  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    full_name,
    username,
    role,
    is_active,
  });

  if (profileError) {
    // Rollback auth user
    await adminClient.auth.admin.deleteUser(userId);
    return { error: `فشل إنشاء الملف الشخصي: ${profileError.message}` };
  }

  // 3. Assign Subjects
  if (role === "student" && subjectIdsRaw.length > 0) {
    const assignments = subjectIdsRaw.map((subId) => ({
      user_id: userId,
      subject_id: subId,
    }));
    await supabase.from("user_subjects").insert(assignments);
  }

  // 4. Log Activity
  await logActivity({
    userId: adminSession.profile.id,
    action: "create_user",
    entityType: "user",
    entityId: userId,
    metadata: { username, full_name, role, assigned_subjects_count: subjectIdsRaw.length },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { success: true, message: "تم إنشاء المستخدم بنجاح" };
}

export async function updateUserAction(formData: FormData) {
  const adminSession = await requireAdmin();

  const id = formData.get("id") as string;
  const full_name = formData.get("full_name") as string;
  const role = (formData.get("role") as string) || "student";
  const is_active = formData.get("is_active") === "true";
  const password = (formData.get("password") as string) || "";
  const subjectIdsRaw = formData.getAll("subject_ids") as string[];

  const validation = UpdateUserSchema.safeParse({
    id,
    full_name,
    role,
    is_active,
    password,
    subject_ids: subjectIdsRaw,
  });

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "البيانات غير صالحة" };
  }

  const supabase = await createClient();
  const adminClient = createAdminClient();

  // 1. Update Profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name,
      role,
      is_active,
    })
    .eq("id", id);

  if (profileError) {
    return { error: `فشل تحديث الملف الشخصي: ${profileError.message}` };
  }

  // 2. If password is provided, update Auth password
  if (password && password.length >= 6) {
    const { error: passError } = await adminClient.auth.admin.updateUserById(id, {
      password,
    });
    if (passError) {
      return { error: `فشل تحديث كلمة المرور: ${passError.message}` };
    }
  }

  // 3. Update subject permissions (Replace existing)
  await supabase.from("user_subjects").delete().eq("user_id", id);

  if (role === "student" && subjectIdsRaw.length > 0) {
    const assignments = subjectIdsRaw.map((subId) => ({
      user_id: id,
      subject_id: subId,
    }));
    await supabase.from("user_subjects").insert(assignments);
  }

  // 4. Log Activity
  await logActivity({
    userId: adminSession.profile.id,
    action: "update_user",
    entityType: "user",
    entityId: id,
    metadata: { full_name, role, is_active, updated_password: Boolean(password) },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { success: true, message: "تم تحديث بيانات المستخدم بنجاح" };
}

export async function toggleUserStatusAction(userId: string, currentStatus: boolean) {
  const adminSession = await requireAdmin();
  const supabase = await createClient();

  const newStatus = !currentStatus;
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: newStatus })
    .eq("id", userId);

  if (error) {
    return { error: "فشل تغيير حالة الحساب: " + error.message };
  }

  await logActivity({
    userId: adminSession.profile.id,
    action: newStatus ? "enable_user" : "disable_user",
    entityType: "user",
    entityId: userId,
  });

  revalidatePath("/admin/users");
  return { success: true, message: newStatus ? "تم تفعيل الحساب" : "تم تعطيل الحساب" };
}

export async function deleteUserAction(userId: string) {
  const adminSession = await requireAdmin();

  // Prevent admin from deleting themselves
  if (adminSession.profile.id === userId) {
    return { error: "لا يمكنك حذف حسابك الحالي" };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    return { error: "فشل حذف المستخدم: " + error.message };
  }

  await logActivity({
    userId: adminSession.profile.id,
    action: "delete_user",
    entityType: "user",
    entityId: userId,
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { success: true, message: "تم حذف المستخدم بنجاح" };
}
