import { z } from "zod";
import { isValidHttpUrl, extractYouTubeVideoId } from "@/lib/youtube/utils";

export const LoginSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يتكون من 3 أحرف على الأقل").max(100),
  password: z.string().min(6, "كلمة المرور يجب أن تتكون من 6 أحرف على الأقل"),
});

export const CreateUserSchema = z.object({
  full_name: z.string().min(2, "الاسم الكامل مطلوب").max(100),
  username: z
    .string()
    .min(3, "اسم المستخدم يجب أن يتكون من 3 أحرف على الأقل")
    .max(30)
    .regex(/^[a-zA-Z0-9_.-]+$/, "اسم المستخدم يجب أن يحتوي على أحرف إنجليزية وأرقام ونقاط فقط"),
  password: z.string().min(6, "كلمة المرور يجب أن تتكون من 6 خانات على الأقل"),
  role: z.enum(["admin", "student"]).default("student"),
  is_active: z.boolean().default(true),
  subject_ids: z.array(z.string().uuid()).optional().default([]),
});

export const UpdateUserSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(2, "الاسم الكامل مطلوب").max(100),
  role: z.enum(["admin", "student"]),
  is_active: z.boolean(),
  password: z.string().min(6, "كلمة المرور يجب أن تتكون من 6 خانات على الأقل").optional().or(z.literal("")),
  subject_ids: z.array(z.string().uuid()).optional().default([]),
});

export const SubjectSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "اسم المادة مطلوب").max(120),
  code: z.string().min(1, "رمز المادة مطلوب").max(20),
  description: z.string().max(500).optional().nullable(),
  image_url: z.string().url("رابط الصورة غير صالح").optional().nullable().or(z.literal("")),
  is_published: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

export const ContentSchema = z.object({
  id: z.string().uuid().optional(),
  subject_id: z.string().uuid("معرف المادة مطلوب"),
  type: z.enum(["lecture", "section", "summary", "exam"]).default("lecture"),
  title: z.string().min(2, "عنوان المحتوى مطلوب").max(200),
  description: z.string().max(2000).optional().nullable(),
  sort_order: z.number().int().default(0),
  is_published: z.boolean().default(false),
});

export const ResourceSchema = z.object({
  id: z.string().uuid().optional(),
  content_id: z.string().uuid("معرف المحتوى مطلوب"),
  type: z.enum(["video", "pdf", "link", "summary", "presentation", "exam"]).default("video"),
  title: z.string().min(2, "عنوان المرفق مطلوب").max(150),
  url: z.string().min(5, "الرابط مطلوب").refine((val) => {
    return isValidHttpUrl(val) && (val.startsWith("https://") || val.startsWith("http://"));
  }, "يجب إدخال رابط صالح يبدأ بـ https://"),
  sort_order: z.number().int().default(0),
  is_published: z.boolean().default(true),
}).superRefine((data, ctx) => {
  if (data.type === "video") {
    const videoId = extractYouTubeVideoId(data.url);
    if (!videoId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "رابط يوتيوب غير صالح. يرجى إدخال رابط يوتيوب صالح (youtube.com أو youtu.be)",
        path: ["url"],
      });
    }
  }
});

export const AnnouncementSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, "عنوان الإعلان مطلوب").max(150),
  content: z.string().min(5, "نص الإعلان مطلوب").max(3000),
  target_type: z.enum(["all", "subject"]).default("all"),
  subject_id: z.string().uuid().optional().nullable(),
  is_published: z.boolean().default(true),
  expires_at: z.string().optional().nullable(),
});

export const PlatformSettingsSchema = z.object({
  platform_name: z.string().min(2, "اسم المنصة مطلوب").max(50),
  platform_name_en: z.string().max(50).optional(),
  description: z.string().max(300).optional(),
  maintenance_mode: z.boolean().default(false),
  theme_default: z.enum(["system", "light", "dark"]).default("system"),
});
