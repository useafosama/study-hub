"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { ContentSchema, ResourceSchema } from "@/lib/validation/schemas";
import { logActivity } from "@/lib/activity/log";
import { Content } from "@/types/database";

export async function getSubjectContents(subjectId: string): Promise<Content[]> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: contents, error } = await supabase
    .from("contents")
    .select(`
      id,
      subject_id,
      type,
      title,
      description,
      sort_order,
      is_published,
      created_at,
      updated_at,
      resources (
        id,
        content_id,
        type,
        title,
        url,
        sort_order,
        is_published,
        created_at,
        updated_at
      )
    `)
    .eq("subject_id", subjectId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch subject contents:", error);
    return [];
  }

  return contents as Content[];
}

export async function createContentWithResourcesAction(formData: FormData) {
  const adminSession = await requireAdmin();
  const supabase = await createClient();

  const subject_id = formData.get("subject_id") as string;
  const type = (formData.get("type") as string) || "lecture";
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const is_published = formData.get("is_published") === "true";
  const sort_order = parseInt((formData.get("sort_order") as string) || "0", 10);

  // Resource inputs
  const videosJson = formData.get("videos_json") as string;
  let videoList: { title: string; url: string }[] = [];

  if (videosJson) {
    try {
      videoList = JSON.parse(videosJson);
    } catch {
      videoList = [];
    }
  } else {
    const singleVideoUrl = (formData.get("video_url") as string) || "";
    const singleVideoTitle = (formData.get("video_title") as string) || "مقطع فيديو الشرح";
    if (singleVideoUrl.trim()) {
      videoList.push({ title: singleVideoTitle, url: singleVideoUrl.trim() });
    }
  }

  const pdf_url = (formData.get("pdf_url") as string) || "";
  const pdf_title = (formData.get("pdf_title") as string) || "ملف المحاضرة (PDF)";
  const link_url = (formData.get("link_url") as string) || "";
  const link_title = (formData.get("link_title") as string) || "رابط إضافي";

  const validation = ContentSchema.safeParse({
    subject_id,
    type,
    title,
    description,
    is_published,
    sort_order,
  });

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "بيانات المحتوى غير صالحة" };
  }

  // 1. Insert Content row
  const { data: content, error: contentError } = await supabase
    .from("contents")
    .insert({
      subject_id,
      type,
      title,
      description,
      is_published,
      sort_order,
    })
    .select("id")
    .single();

  if (contentError || !content) {
    return { error: `فشل إنشاء المحتوى: ${contentError?.message || "خطأ غير معروف"}` };
  }

  const contentId = content.id;
  const resourcesToInsert: any[] = [];

  // 2. Validate & attach all Video resources
  for (let i = 0; i < videoList.length; i++) {
    const v = videoList[i];
    if (v.url && v.url.trim()) {
      const vTitle = v.title?.trim() || (videoList.length > 1 ? `فيديو ${i + 1}` : "مقطع فيديو الشرح");
      const videoValidation = ResourceSchema.safeParse({
        content_id: contentId,
        type: "video",
        title: vTitle,
        url: v.url.trim(),
        sort_order: i,
        is_published: true,
      });

      if (!videoValidation.success) {
        await supabase.from("contents").delete().eq("id", contentId);
        return { error: videoValidation.error.issues[0]?.message || `رابط الفيديو ${i + 1} غير صالح` };
      }

      resourcesToInsert.push({
        content_id: contentId,
        type: "video",
        title: vTitle,
        url: v.url.trim(),
        sort_order: i,
        is_published: true,
      });
    }
  }

  // 3. Validate & attach PDF resource if present
  if (pdf_url.trim()) {
    const pdfValidation = ResourceSchema.safeParse({
      content_id: contentId,
      type: "pdf",
      title: pdf_title,
      url: pdf_url.trim(),
      sort_order: resourcesToInsert.length,
      is_published: true,
    });

    if (!pdfValidation.success) {
      await supabase.from("contents").delete().eq("id", contentId);
      return { error: pdfValidation.error.issues[0]?.message || "رابط PDF غير صالح" };
    }

    resourcesToInsert.push({
      content_id: contentId,
      type: "pdf",
      title: pdf_title,
      url: pdf_url.trim(),
      sort_order: resourcesToInsert.length,
      is_published: true,
    });
  }

  // 4. Validate & attach Link resource if present
  if (link_url.trim()) {
    const linkValidation = ResourceSchema.safeParse({
      content_id: contentId,
      type: "link",
      title: link_title,
      url: link_url.trim(),
      sort_order: resourcesToInsert.length,
      is_published: true,
    });

    if (!linkValidation.success) {
      await supabase.from("contents").delete().eq("id", contentId);
      return { error: linkValidation.error.issues[0]?.message || "الرابط الإضافي غير صالح" };
    }

    resourcesToInsert.push({
      content_id: contentId,
      type: "link",
      title: link_title,
      url: link_url.trim(),
      sort_order: resourcesToInsert.length,
      is_published: true,
    });
  }

  if (resourcesToInsert.length > 0) {
    const { error: resError } = await supabase.from("resources").insert(resourcesToInsert);
    if (resError) {
      console.warn("Failed to insert initial resources:", resError);
    }
  }

  await logActivity({
    userId: adminSession.profile.id,
    action: "create_content",
    entityType: "content",
    entityId: contentId,
    metadata: { title, type, subject_id, resources_count: resourcesToInsert.length },
  });

  revalidatePath(`/admin/subjects/${subject_id}/content`);
  revalidatePath(`/admin/subjects`);
  revalidatePath(`/subjects/${subject_id}`);
  return { success: true, message: "تم إضافة المحتوى بنجاح" };
}

export async function updateContentWithResourcesAction(formData: FormData) {
  const adminSession = await requireAdmin();
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const subject_id = formData.get("subject_id") as string;
  const type = (formData.get("type") as string) || "lecture";
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const is_published = formData.get("is_published") === "true";
  const sort_order = parseInt((formData.get("sort_order") as string) || "0", 10);

  // Resource inputs
  const videosJson = formData.get("videos_json") as string;
  let videoList: { title: string; url: string }[] = [];

  if (videosJson) {
    try {
      videoList = JSON.parse(videosJson);
    } catch {
      videoList = [];
    }
  } else {
    const singleVideoUrl = (formData.get("video_url") as string) || "";
    const singleVideoTitle = (formData.get("video_title") as string) || "مقطع فيديو الشرح";
    if (singleVideoUrl.trim()) {
      videoList.push({ title: singleVideoTitle, url: singleVideoUrl.trim() });
    }
  }

  const pdf_url = (formData.get("pdf_url") as string) || "";
  const pdf_title = (formData.get("pdf_title") as string) || "ملف المحاضرة (PDF)";
  const link_url = (formData.get("link_url") as string) || "";
  const link_title = (formData.get("link_title") as string) || "رابط إضافي";

  const validation = ContentSchema.safeParse({
    id,
    subject_id,
    type,
    title,
    description,
    is_published,
    sort_order,
  });

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "بيانات المحتوى غير صالحة" };
  }

  // 1. Update Content
  const { error: contentError } = await supabase
    .from("contents")
    .update({
      type,
      title,
      description,
      is_published,
      sort_order,
    })
    .eq("id", id);

  if (contentError) {
    return { error: `فشل تحديث المحتوى: ${contentError.message}` };
  }

  // 2. Re-sync resources (delete existing and re-insert if changed)
  await supabase.from("resources").delete().eq("content_id", id);

  const resourcesToInsert: any[] = [];

  for (let i = 0; i < videoList.length; i++) {
    const v = videoList[i];
    if (v.url && v.url.trim()) {
      const vTitle = v.title?.trim() || (videoList.length > 1 ? `فيديو ${i + 1}` : "مقطع فيديو الشرح");
      resourcesToInsert.push({
        content_id: id,
        type: "video",
        title: vTitle,
        url: v.url.trim(),
        sort_order: i,
        is_published: true,
      });
    }
  }

  if (pdf_url.trim()) {
    resourcesToInsert.push({
      content_id: id,
      type: "pdf",
      title: pdf_title,
      url: pdf_url.trim(),
      sort_order: resourcesToInsert.length,
      is_published: true,
    });
  }

  if (link_url.trim()) {
    resourcesToInsert.push({
      content_id: id,
      type: "link",
      title: link_title,
      url: link_url.trim(),
      sort_order: resourcesToInsert.length,
      is_published: true,
    });
  }

  if (resourcesToInsert.length > 0) {
    await supabase.from("resources").insert(resourcesToInsert);
  }

  await logActivity({
    userId: adminSession.profile.id,
    action: "update_content",
    entityType: "content",
    entityId: id,
    metadata: { title, type, subject_id },
  });

  revalidatePath(`/admin/subjects/${subject_id}/content`);
  revalidatePath(`/subjects/${subject_id}`);
  revalidatePath(`/content/${id}`);
  return { success: true, message: "تم تحديث المحتوى والمرفقات بنجاح" };
}

export async function deleteContentAction(id: string, subjectId: string) {
  const adminSession = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("contents").delete().eq("id", id);

  if (error) {
    return { error: "فشل حذف المحتوى: " + error.message };
  }

  await logActivity({
    userId: adminSession.profile.id,
    action: "delete_content",
    entityType: "content",
    entityId: id,
  });

  revalidatePath(`/admin/subjects/${subjectId}/content`);
  revalidatePath(`/subjects/${subjectId}`);
  return { success: true, message: "تم حذف المحتوى بنجاح" };
}

export async function toggleContentPublishAction(id: string, currentStatus: boolean, subjectId: string) {
  const adminSession = await requireAdmin();
  const supabase = await createClient();

  const newStatus = !currentStatus;
  const { error } = await supabase
    .from("contents")
    .update({ is_published: newStatus })
    .eq("id", id);

  if (error) {
    return { error: "فشل تغيير حالة النشر: " + error.message };
  }

  await logActivity({
    userId: adminSession.profile.id,
    action: newStatus ? "publish_content" : "hide_content",
    entityType: "content",
    entityId: id,
  });

  revalidatePath(`/admin/subjects/${subjectId}/content`);
  revalidatePath(`/subjects/${subjectId}`);
  return { success: true, message: newStatus ? "تم نشر المحتوى للطلاب" : "تم إخفاء المحتوى" };
}

export async function reorderContentAction(orderedIds: string[], subjectId: string) {
  const adminSession = await requireAdmin();
  const supabase = await createClient();

  const updates = orderedIds.map((id, index) =>
    supabase.from("contents").update({ sort_order: index }).eq("id", id)
  );

  await Promise.all(updates);

  await logActivity({
    userId: adminSession.profile.id,
    action: "reorder_content",
    entityType: "content",
    metadata: { count: orderedIds.length, subject_id: subjectId },
  });

  revalidatePath(`/admin/subjects/${subjectId}/content`);
  revalidatePath(`/subjects/${subjectId}`);
  return { success: true, message: "تم حفظ ترتيب المحتوى بنجاح" };
}
