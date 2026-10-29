"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { Profile, Subject, Content, ActivityLog } from "@/types/database";

export interface CourseCompletionStat {
  subjectId: string;
  name: string;
  code: string;
  totalContents: number;
  enrolledStudentsCount: number;
  completedContentsTotal: number;
  averageProgress: number;
}

export interface ActiveStudentLeader {
  id: string;
  fullName: string;
  username: string;
  completedLecturesCount: number;
  studyTimeSeconds: number;
  lastActive: string;
}

export interface AdminOverviewData {
  studentsCount: number;
  activeStudentsTodayCount: number;
  totalCoursesCount: number;
  totalLecturesCount: number;
  totalSectionsCount: number;
  totalExamsCount: number;
  totalResourcesCount: number;
  totalStudyHours: number;
  totalCompletionsCount: number;
  overallPlatformProgress: number;
  mostActiveStudents: ActiveStudentLeader[];
  courseStats: CourseCompletionStat[];
  recentContents: any[];
  recentActivityLogs: any[];
}

export async function getAdminOverviewData(): Promise<AdminOverviewData> {
  await requireAdmin();
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartIso = todayStart.toISOString();

  // Run initial parallel queries
  const [
    profilesRes,
    subjectsRes,
    contentsRes,
    resourcesRes,
    progressRes,
    activityRes,
    userSubjectsRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, username, role, is_active, last_login_at, created_at"),
    supabase
      .from("subjects")
      .select("id, name, code, is_published, sort_order"),
    supabase
      .from("contents")
      .select("id, subject_id, type, title, is_published, created_at, subjects(name, code)")
      .order("created_at", { ascending: false }),
    supabase
      .from("resources")
      .select("id, type, content_id"),
    supabase
      .from("content_progress")
      .select("user_id, content_id, completed, completed_at, updated_at")
      .eq("completed", true),
    supabase
      .from("activity_logs")
      .select(`
        id,
        user_id,
        action,
        entity_type,
        entity_id,
        metadata,
        created_at,
        profiles (
          full_name,
          username
        )
      `)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("user_subjects")
      .select("user_id, subject_id"),
  ]);

  const profiles = profilesRes.data || [];
  const subjects = subjectsRes.data || [];
  const contents = contentsRes.data || [];
  const resources = resourcesRes.data || [];
  const progressList = progressRes.data || [];
  const activityLogs = activityRes.data || [];
  const userSubjects = userSubjectsRes.data || [];

  // Filter students
  const students = profiles.filter((p) => p.role === "student" || !p.role);
  const studentsCount = students.length;

  // Active students today
  const activeStudentIds = new Set<string>();
  students.forEach((s) => {
    if (s.last_login_at && new Date(s.last_login_at) >= todayStart) {
      activeStudentIds.add(s.id);
    }
  });
  activityLogs.forEach((log) => {
    if (new Date(log.created_at) >= todayStart && log.user_id) {
      activeStudentIds.add(log.user_id);
    }
  });
  const activeStudentsTodayCount = activeStudentIds.size;

  // Counts by type
  const totalCoursesCount = subjects.length;
  const lectures = contents.filter((c) => c.type === "lecture");
  const sections = contents.filter((c) => c.type === "section");
  const exams = contents.filter((c) => c.type === "exam");
  const totalLecturesCount = lectures.length;
  const totalSectionsCount = sections.length;
  const totalExamsCount = exams.length;
  const totalResourcesCount = resources.length;

  // Study hours aggregation from activity_logs
  let totalStudySeconds = 0;
  const studentStudySecondsMap = new Map<string, number>();

  activityLogs.forEach((log) => {
    if (log.action === "study_session" && log.metadata?.duration) {
      const dur = Number(log.metadata.duration) || 0;
      totalStudySeconds += dur;
      if (log.user_id) {
        studentStudySecondsMap.set(
          log.user_id,
          (studentStudySecondsMap.get(log.user_id) || 0) + dur
        );
      }
    }
  });

  const totalStudyHours = Math.round((totalStudySeconds / 3600) * 10) / 10;
  const totalCompletionsCount = progressList.length;

  // Platform completion rate
  const totalPossibleCompletions = studentsCount * Math.max(1, contents.length);
  const overallPlatformProgress =
    totalPossibleCompletions > 0
      ? Math.min(100, Math.round((totalCompletionsCount / totalPossibleCompletions) * 100))
      : 0;

  // Course stats & completion rates
  const courseStats: CourseCompletionStat[] = subjects.map((sub) => {
    const subContents = contents.filter((c) => c.subject_id === sub.id && c.is_published);
    const subContentIds = new Set(subContents.map((c) => c.id));
    const enrolled = userSubjects.filter((us) => us.subject_id === sub.id);
    const enrolledCount = enrolled.length;

    const completionsForCourse = progressList.filter((p) => subContentIds.has(p.content_id)).length;
    const maxCompletions = enrolledCount * Math.max(1, subContents.length);
    const averageProgress =
      maxCompletions > 0 ? Math.min(100, Math.round((completionsForCourse / maxCompletions) * 100)) : 0;

    return {
      subjectId: sub.id,
      name: sub.name,
      code: sub.code,
      totalContents: subContents.length,
      enrolledStudentsCount: enrolledCount,
      completedContentsTotal: completionsForCourse,
      averageProgress,
    };
  });

  courseStats.sort((a, b) => b.completedContentsTotal - a.completedContentsTotal);

  // Most active students leaderboard
  const studentCompletionsMap = new Map<string, number>();
  progressList.forEach((p) => {
    studentCompletionsMap.set(
      p.user_id,
      (studentCompletionsMap.get(p.user_id) || 0) + 1
    );
  });

  const mostActiveStudents: ActiveStudentLeader[] = students.map((s) => ({
    id: s.id,
    fullName: s.full_name,
    username: s.username,
    completedLecturesCount: studentCompletionsMap.get(s.id) || 0,
    studyTimeSeconds: studentStudySecondsMap.get(s.id) || 0,
    lastActive: s.last_login_at || s.created_at,
  }));

  mostActiveStudents.sort(
    (a, b) =>
      b.completedLecturesCount * 10 +
      b.studyTimeSeconds -
      (a.completedLecturesCount * 10 + a.studyTimeSeconds)
  );

  return {
    studentsCount,
    activeStudentsTodayCount,
    totalCoursesCount,
    totalLecturesCount,
    totalSectionsCount,
    totalExamsCount,
    totalResourcesCount,
    totalStudyHours,
    totalCompletionsCount,
    overallPlatformProgress,
    mostActiveStudents: mostActiveStudents.slice(0, 6),
    courseStats,
    recentContents: contents.slice(0, 6),
    recentActivityLogs: activityLogs.slice(0, 10).map((l: any) => ({
      ...l,
      user_full_name: l.profiles?.full_name || "مستخدم غير معروف",
      user_username: l.profiles?.username || "unknown",
    })),
  };
}

export interface StudentFullDetails {
  student: Profile;
  overallProgressPercentage: number;
  totalCompletedLectures: number;
  totalAssignedLectures: number;
  totalStudySeconds: number;
  completedExamsCount: number;
  totalExamsCount: number;
  coursesBreakdown: {
    subjectId: string;
    name: string;
    code: string;
    totalContents: number;
    completedContents: number;
    progressPercentage: number;
    studySeconds: number;
  }[];
  recentCompletions: {
    contentId: string;
    title: string;
    type: string;
    subjectName: string;
    completedAt: string;
  }[];
  recentActivities: {
    id: string;
    action: string;
    created_at: string;
    metadata: any;
  }[];
  assignedSubjectIds: string[];
}

export async function getStudentFullDetailsAction(
  studentId: string
): Promise<StudentFullDetails | null> {
  await requireAdmin();
  const supabase = await createClient();

  const [
    profileRes,
    userSubjectsRes,
    subjectsRes,
    contentsRes,
    progressRes,
    activityRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", studentId).single(),
    supabase.from("user_subjects").select("subject_id").eq("user_id", studentId),
    supabase.from("subjects").select("id, name, code, is_published"),
    supabase.from("contents").select("id, subject_id, type, title, is_published").eq("is_published", true),
    supabase.from("content_progress").select("content_id, completed, completed_at, updated_at").eq("user_id", studentId).eq("completed", true),
    supabase.from("activity_logs").select("id, action, entity_id, metadata, created_at").eq("user_id", studentId).order("created_at", { ascending: false }).limit(25),
  ]);

  if (!profileRes.data) return null;

  const profile = profileRes.data;
  const assignedSubjectIds = (userSubjectsRes.data || []).map((us) => us.subject_id);
  const subjects = subjectsRes.data || [];
  const contents = contentsRes.data || [];
  const progressList = progressRes.data || [];
  const activityLogs = activityRes.data || [];

  const completedSet = new Set(progressList.map((p) => p.content_id));
  const contentsMap = new Map<string, any>();
  contents.forEach((c) => contentsMap.set(c.id, c));

  const subjectsMap = new Map<string, any>();
  subjects.forEach((s) => subjectsMap.set(s.id, s));

  // Assigned contents
  const assignedContents = contents.filter((c) => assignedSubjectIds.includes(c.subject_id));
  const totalAssignedLectures = assignedContents.length;
  const totalCompletedLectures = assignedContents.filter((c) => completedSet.has(c.id)).length;
  const overallProgressPercentage =
    totalAssignedLectures > 0
      ? Math.round((totalCompletedLectures / totalAssignedLectures) * 100)
      : 0;

  // Study time & course study time
  let totalStudySeconds = 0;
  const courseStudyTimeMap = new Map<string, number>();

  activityLogs.forEach((log) => {
    if (log.action === "study_session" && log.metadata?.duration) {
      const dur = Number(log.metadata.duration) || 0;
      totalStudySeconds += dur;
      const courseId = log.metadata?.courseId || log.entity_id;
      if (courseId) {
        courseStudyTimeMap.set(courseId, (courseStudyTimeMap.get(courseId) || 0) + dur);
      }
    }
  });

  // Exams
  const assignedExams = assignedContents.filter((c) => c.type === "exam");
  const totalExamsCount = assignedExams.length;
  const completedExamsCount = assignedExams.filter((c) => completedSet.has(c.id)).length;

  // Courses breakdown
  const coursesBreakdown = assignedSubjectIds.map((subId) => {
    const sub = subjectsMap.get(subId) || { name: "مادة دراسية", code: "" };
    const subContents = contents.filter((c) => c.subject_id === subId);
    const subCompleted = subContents.filter((c) => completedSet.has(c.id)).length;
    const pct = subContents.length > 0 ? Math.round((subCompleted / subContents.length) * 100) : 0;

    return {
      subjectId: subId,
      name: sub.name,
      code: sub.code,
      totalContents: subContents.length,
      completedContents: subCompleted,
      progressPercentage: pct,
      studySeconds: courseStudyTimeMap.get(subId) || 0,
    };
  });

  // Recent completions
  const recentCompletions = progressList.slice(0, 6).map((p) => {
    const c = contentsMap.get(p.content_id);
    const s = c ? subjectsMap.get(c.subject_id) : null;
    return {
      contentId: p.content_id,
      title: c?.title || "درس مكتمل",
      type: c?.type || "lecture",
      subjectName: s?.name || "المادة",
      completedAt: p.completed_at || p.updated_at || new Date().toISOString(),
    };
  });

  return {
    student: profile,
    overallProgressPercentage,
    totalCompletedLectures,
    totalAssignedLectures,
    totalStudySeconds,
    completedExamsCount,
    totalExamsCount,
    coursesBreakdown,
    recentCompletions,
    recentActivities: activityLogs.slice(0, 10),
    assignedSubjectIds,
  };
}
