"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { PlatformSettingsSchema } from "@/lib/validation/schemas";
import { logActivity } from "@/lib/activity/log";
import { PlatformSettings } from "@/types/database";

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "general")
    .single();

  if (error || !data) {
    return {
      platform_name: "منصة ستادي هب",
      platform_name_en: "Study Hub",
      description: "منصة تعليمية خاصة للدراسة وتنظيم المحتوى الأكاديمي",
      maintenance_mode: false,
      theme_default: "system",
    };
  }

  return data.value as PlatformSettings;
}

export async function updatePlatformSettingsAction(formData: FormData) {
  const adminSession = await requireAdmin();
  const supabase = await createClient();

  const platform_name = formData.get("platform_name") as string;
  const platform_name_en = (formData.get("platform_name_en") as string) || "";
  const description = (formData.get("description") as string) || "";
  const maintenance_mode = formData.get("maintenance_mode") === "true";
  const theme_default = (formData.get("theme_default") as any) || "system";

  const validation = PlatformSettingsSchema.safeParse({
    platform_name,
    platform_name_en,
    description,
    maintenance_mode,
    theme_default,
  });

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "بيانات الإعدادات غير صالحة" };
  }

  const { error } = await supabase
    .from("platform_settings")
    .upsert({
      key: "general",
      value: {
        platform_name,
        platform_name_en,
        description,
        maintenance_mode,
        theme_default,
      },
      updated_at: new Date().toISOString(),
    });

  if (error) {
    return { error: "فشل حفظ الإعدادات: " + error.message };
  }

  await logActivity({
    userId: adminSession.profile.id,
    action: "update_settings",
    entityType: "settings",
    metadata: { platform_name, maintenance_mode },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return { success: true, message: "تم تحديث إعدادات المنصة بنجاح" };
}
