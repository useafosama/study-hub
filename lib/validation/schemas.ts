import { z } from "zod";
import { isValidHttpUrl, extractYouTubeVideoId } from "@/lib/youtube/utils";

// Universal PostgreSQL-compatible UUID schema (accepts any 32 hex characters with standard 8-4-4-4-12 hyphenation)
export const uuidSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    "معرف غير صالح"
  );

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
  subject_ids: z.array(uuidSchema).optional().default([]),
});

export const UpdateUserSchema = z.object({
  id: uuidSchema,
  full_name: z.string().min(2, "الاسم الكامل مطلوب").max(100),
  role: z.enum(["admin", "student"]),
  is_active: z.boolean(),
  password: z.string().min(6, "كلمة المرور يجب أن تتكون من 6 خانات على الأقل").optional().or(z.literal("")),
  subject_ids: z.array(uuidSchema).optional().default([]),
});

export const SubjectSchema = z.object({
  id: uuidSchema.optional(),
  name: z.string().min(2, "اسم المادة مطلوب").max(120),
  code: z.string().min(1, "رمز المادة مطلوب").max(20),
  description: z.string().max(500).optional().nullable(),
  image_url: z.string().url("رابط الصورة غير صالح").optional().nullable().or(z.literal("")),
  is_published: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

export const ContentSchema = z.object({
  id: uuidSchema.optional(),
  subject_id: uuidSchema,
  type: z.enum(["lecture", "section", "summary", "exam"]).default("lecture"),
  title: z.string().min(2, "عنوان المحتوى مطلوب").max(200),
  description: z.string().max(2000).optional().nullable(),
  sort_order: z.number().int().default(0),
  is_published: z.boolean().default(false),
});

export const ResourceSchema = z.object({
  id: uuidSchema.optional(),
  content_id: uuidSchema,
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
  id: uuidSchema.optional(),
  title: z.string().min(3, "عنوان الإعلان مطلوب").max(150),
  content: z.string().min(5, "نص الإعلان مطلوب").max(3000),
  target_type: z.enum(["all", "subject"]).default("all"),
  subject_id: uuidSchema.optional().nullable(),
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
