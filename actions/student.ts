"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { Subject, Content, Announcement, Bookmark, ContentType } from "@/types/database";
import { logActivity } from "@/lib/activity/log";

export async function getStudentDashboardData() {
  const session = await requireAuth();
  const supabase = await createClient();
  const userId = session.profile.id;

  // 1. Get assigned published subjects
  const { data: userSubjects, error: subError } = await supabase
    .from("user_subjects")
    .select(`
      subject_id,
      subjects (
        id,
        name,
        code,
        description,
        image_url,
        is_published,
        sort_order
      )
    `)
    .eq("user_id", userId);

  const subjects: Subject[] = [];
  const assignedSubjectIds: string[] = [];

  if (userSubjects) {
    for (const item of userSubjects) {
      const sub = (item as any).subjects;
      if (sub && sub.is_published) {
        assignedSubjectIds.push(sub.id);
        subjects.push(sub);
      }
    }
  }

  // Sort subjects by sort_order
  subjects.sort((a, b) => a.sort_order - b.sort_order);

  // 2. Compute progress for each assigned subject
  if (assignedSubjectIds.length > 0) {
    const { data: contents } = await supabase
      .from("contents")
      .select("id, subject_id")
      .in("subject_id", assignedSubjectIds)
      .eq("is_published", true);

    const { data: progressList } = await supabase
      .from("content_progress")
      .select("content_id, completed")
      .eq("user_id", userId)
      .eq("completed", true);

    const completedContentIds = new Set(progressList?.map((p) => p.content_id) || []);

    subjects.forEach((s) => {
      const subjectContents = contents?.filter((c) => c.subject_id === s.id) || [];
      const total = subjectContents.length;
      const completed = subjectContents.filter((c) => completedContentIds.has(c.id)).length;
      s.total_contents = total;
      s.completed_contents = completed;
      s.progress_percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    });
  }

  // 3. Get Active Announcements
  const { data: announcements } = await supabase
    .from("announcements")
    .select(`
      id,
      title,
      content,
      target_type,
      subject_id,
      created_at,
      subjects (name)
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(5);

  const formattedAnnouncements: Announcement[] = (announcements || []).map((a: any) => ({
    ...a,
    subject_name: a.subjects?.name || null,
  }));

  // 4. Get Recently Added Content in Assigned Subjects
  let recentContents: any[] = [];
  if (assignedSubjectIds.length > 0) {
    const { data: recents } = await supabase
      .from("contents")
      .select(`
        id,
        subject_id,
        type,
        title,
        created_at,
        subjects (
          id,
          name,
          code
        ),
        resources (
          type
        )
      `)
      .in("subject_id", assignedSubjectIds)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(6);

    recentContents = recents || [];
  }

  return {
    profile: session.profile,
    subjects,
    announcements: formattedAnnouncements,
    recentContents,
  };
}

export async function getStudentSubject(subjectId: string) {
  const session = await requireAuth();
  const supabase = await createClient();
  const userId = session.profile.id;

  // 1. Fetch Subject
  const { data: subject, error: subError } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", subjectId)
    .eq("is_published", true)
    .single();

  if (subError || !subject) {
    return null;
  }

  // 2. Fetch Contents with resources
  const { data: contents, error: contError } = await supabase
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
      resources (
        id,
        type,
        title,
        url,
        sort_order
      )
    `)
    .eq("subject_id", subjectId)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (contError || !contents) {
    return { subject, lectures: [], sections: [], progressPercentage: 0 };
  }

  // 3. Fetch progress and bookmarks
  const contentIds = contents.map((c) => c.id);
  let completedSet = new Set<string>();
  let bookmarkSet = new Set<string>();

  if (contentIds.length > 0) {
    const { data: progresses } = await supabase
      .from("content_progress")
      .select("content_id")
      .eq("user_id", userId)
      .eq("completed", true)
      .in("content_id", contentIds);

    const { data: bookmarks } = await supabase
      .from("bookmarks")
      .select("content_id")
      .eq("user_id", userId)
      .in("content_id", contentIds);

    completedSet = new Set(progresses?.map((p) => p.content_id) || []);
    bookmarkSet = new Set(bookmarks?.map((b) => b.content_id) || []);
  }

  const enrichedContents: Content[] = contents.map((c: any) => ({
    ...c,
    is_completed: completedSet.has(c.id),
    is_bookmarked: bookmarkSet.has(c.id),
    resources: (c.resources || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
  }));

  const lectures = enrichedContents.filter((c) => c.type === "lecture" || c.type === "summary" || c.type === "exam");
  const sections = enrichedContents.filter((c) => c.type === "section");

  const totalCount = enrichedContents.length;
  const completedCount = enrichedContents.filter((c) => c.is_completed).length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    subject,
    lectures,
    sections,
    allContents: enrichedContents,
    totalCount,
    completedCount,
    progressPercentage,
  };
}

export async function getStudentContent(contentId: string) {
  const session = await requireAuth();
  const supabase = await createClient();
  const userId = session.profile.id;

  // 1. Fetch content and subject info
  const { data: content, error } = await supabase
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
      subjects (
        id,
        name,
        code,
        is_published
      ),
      resources (
        id,
        content_id,
        type,
        title,
        url,
        sort_order,
        is_published
      )
    `)
    .eq("id", contentId)
    .eq("is_published", true)
    .single();

  if (error || !content || !(content.subjects as any)?.is_published) {
    return null;
  }

  // 2. Fetch progress & bookmark
  const { data: progress } = await supabase
    .from("content_progress")
    .select("completed")
    .eq("user_id", userId)
    .eq("content_id", contentId)
    .maybeSingle();

  const { data: bookmark } = await supabase
    .from("bookmarks")
    .select("content_id")
    .eq("user_id", userId)
    .eq("content_id", contentId)
    .maybeSingle();

  // 3. Fetch sibling contents in this subject for Next / Previous navigation
  const { data: siblings } = await supabase
    .from("contents")
    .select("id, title, type, sort_order")
    .eq("subject_id", content.subject_id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const siblingList = siblings || [];
  const currentIndex = siblingList.findIndex((s) => s.id === contentId);
  const prevContent = currentIndex > 0 ? siblingList[currentIndex - 1] : null;
  const nextContent = currentIndex >= 0 && currentIndex < siblingList.length - 1 ? siblingList[currentIndex + 1] : null;

  return {
    content: {
      ...content,
      is_completed: progress?.completed || false,
      is_bookmarked: Boolean(bookmark),
      resources: (content.resources || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    },
    subject: content.subjects,
    prevContent,
    nextContent,
  };
}

export async function toggleContentCompletionAction(contentId: string, currentStatus: boolean, subjectId?: string) {
  const session = await requireAuth();
  const supabase = await createClient();
  const userId = session.profile.id;
  const newStatus = !currentStatus;

  const { error } = await supabase
    .from("content_progress")
    .upsert({
      user_id: userId,
      content_id: contentId,
      completed: newStatus,
      completed_at: newStatus ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    return { error: "فشل تحديث حالة الإكمال: " + error.message };
  }

  revalidatePath(`/content/${contentId}`);
  if (subjectId) {
    revalidatePath(`/subjects/${subjectId}`);
  }
  revalidatePath("/dashboard");
  return { success: true, isCompleted: newStatus };
}

export async function toggleBookmarkAction(contentId: string, currentStatus: boolean) {
  const session = await requireAuth();
  const supabase = await createClient();
  const userId = session.profile.id;

  if (currentStatus) {
    await supabase.from("bookmarks").delete().match({
      user_id: userId,
      content_id: contentId,
    });
  } else {
    await supabase.from("bookmarks").insert({
      user_id: userId,
      content_id: contentId,
    });
  }

  revalidatePath(`/content/${contentId}`);
  revalidatePath("/bookmarks");
  revalidatePath("/dashboard");
  return { success: true, isBookmarked: !currentStatus };
}

export async function getStudentBookmarks(): Promise<Bookmark[]> {
  const session = await requireAuth();
  const supabase = await createClient();
  const userId = session.profile.id;

  const { data: bookmarks, error } = await supabase
    .from("bookmarks")
    .select(`
      user_id,
      content_id,
      created_at,
      contents (
        id,
        subject_id,
        type,
        title,
        description,
        is_published,
        subjects (
          id,
          name,
          code
        ),
        resources (
          type
        )
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !bookmarks) {
    return [];
  }

  return bookmarks
    .filter((b: any) => b.contents && b.contents.is_published)
    .map((b: any) => ({
      user_id: b.user_id,
      content_id: b.content_id,
      created_at: b.created_at,
      content: {
        ...b.contents,
        resources: b.contents.resources,
      },
      subject: b.contents.subjects,
    }));
}

export async function searchAccessibleContent(query: string) {
  const session = await requireAuth();
  const supabase = await createClient();
  const userId = session.profile.id;

  if (!query || query.trim().length < 2) {
    return { subjects: [], contents: [], resources: [] };
  }

  const searchTerm = `%${query.trim()}%`;

  // 1. Search assigned published subjects
  const { data: userSubjects } = await supabase
    .from("user_subjects")
    .select("subject_id")
    .eq("user_id", userId);

  const assignedSubjectIds = userSubjects?.map((us) => us.subject_id) || [];
  if (assignedSubjectIds.length === 0) {
    return { subjects: [], contents: [], resources: [] };
  }

  const { data: matchingSubjects } = await supabase
    .from("subjects")
    .select("id, name, code, description")
    .in("id", assignedSubjectIds)
    .eq("is_published", true)
    .or(`name.ilike.${searchTerm},code.ilike.${searchTerm},description.ilike.${searchTerm}`)
    .limit(10);

  // 2. Search contents in assigned subjects
  const { data: matchingContents } = await supabase
    .from("contents")
    .select(`
      id,
      title,
      type,
      description,
      subject_id,
      subjects (
        id,
        name,
        code
      ),
      resources (
        type
      )
    `)
    .in("subject_id", assignedSubjectIds)
    .eq("is_published", true)
    .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
    .limit(20);

  // 3. Search resources
  const { data: matchingResources } = await supabase
    .from("resources")
    .select(`
      id,
      title,
      type,
      url,
      content_id,
      contents!inner (
        id,
        title,
        subject_id,
        is_published,
        subjects!inner (
          id,
          name,
          code
        )
      )
    `)
    .in("contents.subject_id", assignedSubjectIds)
    .eq("contents.is_published", true)
    .eq("is_published", true)
    .ilike("title", searchTerm)
    .limit(15);

  return {
    subjects: matchingSubjects || [],
    contents: matchingContents || [],
    resources: matchingResources || [],
  };
}

export interface RecordStudySessionParams {
  sessionId?: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  lectureId?: string | null;
  lectureTitle?: string | null;
  startTime: string;
  endTime: string;
  duration: number; // in seconds
  targetDuration: number; // in seconds
  completionStatus: "completed" | "early_finish";
}

export async function recordStudySessionAction(params: RecordStudySessionParams) {
  const session = await requireAuth();
  const supabase = await createClient();
  const userId = session.profile.id;

  // 1. Try writing directly to study_sessions table if it exists
  try {
    const isSubjectValid = params.courseId && params.courseId !== "general";
    await supabase.from("study_sessions").insert({
      id: params.sessionId,
      user_id: userId,
      subject_id: isSubjectValid ? params.courseId : null,
      content_id: params.lectureId || null,
      start_time: params.startTime,
      end_time: params.endTime,
      duration_seconds: params.duration,
      target_duration_seconds: params.targetDuration,
      completion_status: params.completionStatus,
    });
  } catch (err) {
    // Graceful fallback if table is not yet created
    console.debug("Note: study_sessions table insert skipped or pending migration", err);
  }

  // 2. Log activity to activity_logs for audit & admin monitoring
  await logActivity({
    userId,
    action: "study_session",
    entityType: "study_session",
    entityId: params.lectureId || (params.courseId !== "general" ? params.courseId : null),
    metadata: {
      courseName: params.courseName,
      courseCode: params.courseCode,
      lectureTitle: params.lectureTitle,
      duration: params.duration,
      targetDuration: params.targetDuration,
      completionStatus: params.completionStatus,
      durationMinutes: Math.round(params.duration / 60),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin/activity");
  return { success: true };
}

export interface RecentlyCompletedItem {
  contentId: string;
  contentTitle: string;
  contentType: ContentType;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  completedAt: string;
}

export interface EnrichedSubjectStats extends Subject {
  total_contents: number;
  completed_contents: number;
  remaining_contents: number;
  progress_percentage: number;
  exams_count: number;
  completed_exams_count: number;
}

export interface StudentAnalyticsData {
  profile: any;
  subjects: EnrichedSubjectStats[];
  totalContentsCount: number;
  totalCompletedCount: number;
  overallPercentage: number;
  completedSubjectsCount: number;
  recentlyCompletedContents: RecentlyCompletedItem[];
  serverStudySessions: {
    id: string;
    courseId: string;
    courseName: string;
    courseCode: string;
    lectureTitle?: string | null;
    duration: number;
    startTime: string;
    endTime: string;
    completionStatus: string;
  }[];
}

export async function getStudentAnalyticsData(): Promise<StudentAnalyticsData> {
  const session = await requireAuth();
  const supabase = await createClient();
  const userId = session.profile.id;

  // 1. Get assigned published subjects
  const { data: userSubjects } = await supabase
    .from("user_subjects")
    .select(`
      subject_id,
      subjects (
        id,
        name,
        code,
        description,
        image_url,
        is_published,
        sort_order
      )
    `)
    .eq("user_id", userId);

  const subjects: EnrichedSubjectStats[] = [];
  const assignedSubjectIds: string[] = [];

  if (userSubjects) {
    for (const item of userSubjects) {
      const sub = (item as any).subjects;
      if (sub && sub.is_published) {
        assignedSubjectIds.push(sub.id);
        subjects.push({
          ...sub,
          total_contents: 0,
          completed_contents: 0,
          remaining_contents: 0,
          progress_percentage: 0,
          exams_count: 0,
          completed_exams_count: 0,
        });
      }
    }
  }

  subjects.sort((a, b) => a.sort_order - b.sort_order);

  let totalContentsCount = 0;
  let totalCompletedCount = 0;
  const recentlyCompletedContents: RecentlyCompletedItem[] = [];

  if (assignedSubjectIds.length > 0) {
    // 2. Query all contents & student's progress in parallel
    const [contentsRes, progressRes, activityRes] = await Promise.all([
      supabase
        .from("contents")
        .select("id, subject_id, type, title, sort_order")
        .in("subject_id", assignedSubjectIds)
        .eq("is_published", true),
      supabase
        .from("content_progress")
        .select("content_id, completed, completed_at, updated_at")
        .eq("user_id", userId)
        .eq("completed", true),
      supabase
        .from("activity_logs")
        .select("id, entity_id, metadata, created_at")
        .eq("user_id", userId)
        .eq("action", "study_session")
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    const contents = contentsRes.data || [];
    const progressList = progressRes.data || [];
    const activityLogs = activityRes.data || [];

    const completedProgressMap = new Map<string, { completed_at?: string; updated_at?: string }>();
    progressList.forEach((p) => {
      completedProgressMap.set(p.content_id, {
        completed_at: p.completed_at || p.updated_at,
        updated_at: p.updated_at,
      });
    });

    const contentsMap = new Map<string, any>();
    contents.forEach((c) => contentsMap.set(c.id, c));

    const subjectsMap = new Map<string, EnrichedSubjectStats>();
    subjects.forEach((s) => subjectsMap.set(s.id, s));

    totalContentsCount = contents.length;
    totalCompletedCount = progressList.length;

    // Calculate per-subject stats
    subjects.forEach((s) => {
      const subjectContents = contents.filter((c) => c.subject_id === s.id);
      const total = subjectContents.length;
      const completed = subjectContents.filter((c) => completedProgressMap.has(c.id)).length;
      const exams = subjectContents.filter((c) => c.type === "exam");
      const completedExams = exams.filter((c) => completedProgressMap.has(c.id)).length;

      s.total_contents = total;
      s.completed_contents = completed;
      s.remaining_contents = Math.max(0, total - completed);
      s.progress_percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      s.exams_count = exams.length;
      s.completed_exams_count = completedExams;
    });

    // Populate recently completed contents
    const sortedProgress = [...progressList].sort((a, b) => {
      const dateA = new Date(a.completed_at || a.updated_at).getTime();
      const dateB = new Date(b.completed_at || b.updated_at).getTime();
      return dateB - dateA;
    });

    for (const p of sortedProgress.slice(0, 8)) {
      const content = contentsMap.get(p.content_id);
      if (content) {
        const subject = subjectsMap.get(content.subject_id);
        if (subject) {
          recentlyCompletedContents.push({
            contentId: content.id,
            contentTitle: content.title,
            contentType: content.type as ContentType,
            subjectId: subject.id,
            subjectName: subject.name,
            subjectCode: subject.code,
            completedAt: p.completed_at || p.updated_at || new Date().toISOString(),
          });
        }
      }
    }

    // Extract server study sessions
    const serverStudySessions = activityLogs.map((log) => {
      const meta = log.metadata || {};
      return {
        id: log.id,
        courseId: log.entity_id || meta.courseId || "general",
        courseName: meta.courseName || "مادة دراسية",
        courseCode: meta.courseCode || "",
        lectureTitle: meta.lectureTitle || null,
        duration: meta.duration || 0,
        startTime: meta.startTime || log.created_at,
        endTime: meta.endTime || log.created_at,
        completionStatus: meta.completionStatus || "completed",
      };
    });

    const overallPercentage =
      totalContentsCount > 0 ? Math.round((totalCompletedCount / totalContentsCount) * 100) : 0;
    const completedSubjectsCount = subjects.filter((s) => s.progress_percentage === 100).length;

    return {
      profile: session.profile,
      subjects,
      totalContentsCount,
      totalCompletedCount,
      overallPercentage,
      completedSubjectsCount,
      recentlyCompletedContents,
      serverStudySessions,
    };
  }

  return {
    profile: session.profile,
    subjects: [],
    totalContentsCount: 0,
    totalCompletedCount: 0,
    overallPercentage: 0,
    completedSubjectsCount: 0,
    recentlyCompletedContents: [],
    serverStudySessions: [],
  };
}
