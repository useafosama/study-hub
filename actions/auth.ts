"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { usernameToInternalEmail } from "@/lib/auth/utils";
import { LoginSchema } from "@/lib/validation/schemas";
import { logActivity } from "@/lib/activity/log";

export async function loginAction(prevState: any, formData: FormData) {
  const username = (formData.get("username") as string)?.trim() || "";
  const password = (formData.get("password") as string) || "";

  console.log(`[AUTH LOGIN ATTEMPT] Input Username: "${username}"`);

  const validation = LoginSchema.safeParse({ username, password });
  if (!validation.success) {
    console.warn(`[AUTH VALIDATION ERROR]`, validation.error.issues);
    return {
      error: validation.error.issues[0]?.message || "يرجى التحقق من صحة البيانات المدخلة",
    };
  }

  const supabase = await createClient();
  const internalEmail = usernameToInternalEmail(username);

  console.log(`[AUTH MAPPING] Internal Email: "${internalEmail}"`);

  // Authenticate with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: internalEmail,
    password: password,
  });

  if (authError || !authData.user) {
    console.error(`[AUTH SIGNIN FAILED] Message: "${authError?.message}", Status: ${authError?.status}, Code: ${authError?.code}`);
    
    if (authError?.message?.includes("Invalid login credentials") || authError?.status === 400) {
      return {
        error: "اسم المستخدم أو كلمة المرور غير صحيحة",
      };
    }

    if (authError?.message?.includes("Database error") || authError?.status === 500) {
      return {
        error: `خطأ في خادم المصادقة: ${authError.message}`,
      };
    }

    return {
      error: authError?.message || "تعذر تسجيل الدخول. يرجى التحقق من البيانات أو المحاولة لاحقاً.",
    };
  }

  console.log(`[AUTH SIGNIN SUCCESS] User ID: ${authData.user.id}, Email: ${authData.user.email}`);

  // Fetch profile by auth.uid() (authData.user.id)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile) {
    console.error(`[AUTH PROFILE ERROR] Could not find profile for user ID: ${authData.user.id}`, profileError);
    await supabase.auth.signOut();
    return {
      error: "لم يتم العثور على الملف الشخصي للمستخدم في النظام",
    };
  }

  console.log(`[AUTH PROFILE FOUND] Profile Username: ${profile.username}, Role: ${profile.role}, Active: ${profile.is_active}`);

  // Check if account is active
  if (!profile.is_active) {
    console.warn(`[AUTH INACTIVE ACCOUNT] User ID: ${authData.user.id} is inactive.`);
    await supabase.auth.signOut();
    return {
      error: "تم تعطيل هذا الحساب من قبل المسؤول. يرجى التواصل مع إدارة المنصة.",
    };
  }

  // Update last login timestamp
  await supabase
    .from("profiles")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", profile.id);

  // Log activity
  await logActivity({
    userId: profile.id,
    action: "login",
    entityType: "user",
    entityId: profile.id,
    metadata: { username: profile.username, role: profile.role },
  });

  revalidatePath("/", "layout");

  // Redirect based on role
  if (profile.role === "admin") {
    console.log(`[AUTH REDIRECT] Redirecting admin to /admin`);
    redirect("/admin");
  } else {
    console.log(`[AUTH REDIRECT] Redirecting student to /dashboard`);
    redirect("/dashboard");
  }
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function changePasswordAction(formData: FormData) {
  const supabase = await createClient();
  const newPassword = formData.get("new_password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!newPassword || newPassword.length < 6) {
    return { error: "كلمة المرور يجب أن تتكون من 6 أحرف على الأقل" };
  }

  if (newPassword !== confirmPassword) {
    return { error: "كلمتا المرور غير متطابقتين" };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: "فشل تحديث كلمة المرور: " + error.message };
  }

  return { success: true, message: "تم تغيير كلمة المرور بنجاح" };
}
