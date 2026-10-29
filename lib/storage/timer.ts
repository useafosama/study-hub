export interface StudySessionRecord {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  lectureId?: string | null;
  lectureTitle?: string | null;
  startTime: string; // ISO
  endTime: string; // ISO
  duration: number; // focused seconds
  targetDuration: number; // planned seconds
  completionStatus: "completed" | "early_finish";
  createdAt: number;
}

export interface ActiveTimerState {
  courseId: string;
  courseName: string;
  courseCode: string;
  lectureId?: string | null;
  lectureTitle?: string | null;
  targetDurationSeconds: number;
  elapsedFocusSeconds: number;
  isRunning: boolean;
  startTime: string; // ISO
  lastTickTimestamp: number; // Date.now()
}

const SESSIONS_STORAGE_KEY = "studyhub_study_sessions";
const ACTIVE_TIMER_STORAGE_KEY = "studyhub_active_timer_session";
const DAILY_GOAL_STORAGE_KEY = "studyhub_daily_goal_minutes";

export const TIMER_PRESETS = [
  { label: "25 دقيقة", minutes: 25, sublabel: "تركيز بومودورو" },
  { label: "50 دقيقة", minutes: 50, sublabel: "جلسة عميقة" },
  { label: "90 دقيقة", minutes: 90, sublabel: "ماراثون دراسي" },
] as const;

/**
 * Get all stored sessions from localStorage.
 */
export function getStoredSessions(userId?: string): StudySessionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) return [];
    const sessions: StudySessionRecord[] = JSON.parse(raw);
    if (!Array.isArray(sessions)) return [];
    if (userId) {
      return sessions.filter((s) => !s.userId || s.userId === userId);
    }
    return sessions;
  } catch (err) {
    console.error("Error reading stored study sessions:", err);
    return [];
  }
}

/**
 * Save a new completed or early-finished session.
 * Prevents duplicates by ID.
 */
export function saveCompletedSession(session: StudySessionRecord): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredSessions();
    // Prevent duplicate
    if (existing.some((s) => s.id === session.id)) {
      return;
    }
    const updated = [session, ...existing];
    // Keep max 500 recent sessions in local storage to prevent bloating
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated.slice(0, 500)));
  } catch (err) {
    console.error("Error saving completed study session:", err);
  }
}

/**
 * Get the currently active in-progress timer state (if any).
 * Adjusts elapsed seconds automatically if it was running while page was refreshed or closed.
 */
export function getActiveSession(): ActiveTimerState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_TIMER_STORAGE_KEY);
    if (!raw) return null;
    const state: ActiveTimerState = JSON.parse(raw);
    if (!state || !state.targetDurationSeconds) return null;

    // If it was running when last saved, compute real elapsed time
    if (state.isRunning && state.lastTickTimestamp) {
      const now = Date.now();
      const deltaSeconds = Math.max(0, Math.floor((now - state.lastTickTimestamp) / 1000));
      if (deltaSeconds > 0) {
        state.elapsedFocusSeconds = Math.min(
          state.targetDurationSeconds,
          state.elapsedFocusSeconds + deltaSeconds
        );
        state.lastTickTimestamp = now;
        // Save the updated calculation
        saveActiveSession(state);
      }
    }

    return state;
  } catch (err) {
    console.error("Error retrieving active timer session:", err);
    return null;
  }
}

/**
 * Save the active timer state.
 */
export function saveActiveSession(state: ActiveTimerState | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!state) {
      localStorage.removeItem(ACTIVE_TIMER_STORAGE_KEY);
    } else {
      localStorage.setItem(ACTIVE_TIMER_STORAGE_KEY, JSON.stringify(state));
    }
  } catch (err) {
    console.error("Error saving active timer session:", err);
  }
}

/**
 * Clear the active session.
 */
export function clearActiveSession(): void {
  saveActiveSession(null);
}

/**
 * Get daily study goal in minutes (default 120 mins).
 */
export function getDailyGoalMinutes(): number {
  if (typeof window === "undefined") return 120;
  try {
    const raw = localStorage.getItem(DAILY_GOAL_STORAGE_KEY);
    if (!raw) return 120;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) || parsed <= 0 ? 120 : parsed;
  } catch {
    return 120;
  }
}

/**
 * Set daily study goal in minutes.
 */
export function setDailyGoalMinutes(minutes: number): void {
  if (typeof window === "undefined") return;
  try {
    const safeMinutes = Math.max(10, Math.min(720, minutes));
    localStorage.setItem(DAILY_GOAL_STORAGE_KEY, safeMinutes.toString());
  } catch (err) {
    console.error("Error setting daily goal:", err);
  }
}

/**
 * Get today's study stats.
 */
export function getTodayStudyStats(userId?: string) {
  const sessions = getStoredSessions(userId);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;

  const todaySessions = sessions.filter((s) => {
    const sessionTime = new Date(s.endTime || s.startTime).getTime();
    return sessionTime >= todayStart && sessionTime < todayEnd;
  });

  const todaySeconds = todaySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const completedCount = todaySessions.filter((s) => s.completionStatus === "completed").length;
  const sessionsCount = todaySessions.length;
  const dailyGoalMinutes = getDailyGoalMinutes();
  const dailyGoalSeconds = dailyGoalMinutes * 60;
  const progressPercentage = Math.min(
    100,
    dailyGoalSeconds > 0 ? Math.round((todaySeconds / dailyGoalSeconds) * 100) : 0
  );

  return {
    todaySeconds,
    todayMinutes: Math.round(todaySeconds / 60),
    todayHoursFormatted: (todaySeconds / 3600).toFixed(1),
    sessionsCount,
    completedCount,
    dailyGoalMinutes,
    progressPercentage,
    todaySessions,
  };
}

/**
 * Get the past 7 days trend for charting.
 */
export function getWeeklyStudyTrend(userId?: string) {
  const sessions = getStoredSessions(userId);
  const now = new Date();
  const days: { dayName: string; dateStr: string; seconds: number; isToday: boolean }[] = [];

  const arabicDays = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dayStart = d.getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    const daySessions = sessions.filter((s) => {
      const sessionTime = new Date(s.endTime || s.startTime).getTime();
      return sessionTime >= dayStart && sessionTime < dayEnd;
    });

    const totalSeconds = daySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const dayName = i === 0 ? "اليوم" : arabicDays[d.getDay()];

    days.push({
      dayName,
      dateStr: `${d.getMonth() + 1}/${d.getDate()}`,
      seconds: totalSeconds,
      isToday: i === 0,
    });
  }

  return days;
}

/**
 * Get study time grouped by course.
 */
export function getCourseBreakdown(userId?: string) {
  const sessions = getStoredSessions(userId);
  const map = new Map<
    string,
    {
      courseId: string;
      courseName: string;
      courseCode: string;
      totalSeconds: number;
      sessionCount: number;
    }
  >();

  sessions.forEach((s) => {
    const key = s.courseId || s.courseName || "other";
    const existing = map.get(key) || {
      courseId: s.courseId || "other",
      courseName: s.courseName || "مادة دراسية",
      courseCode: s.courseCode || "",
      totalSeconds: 0,
      sessionCount: 0,
    };
    existing.totalSeconds += s.duration || 0;
    existing.sessionCount += 1;
    map.set(key, existing);
  });

  return Array.from(map.values()).sort((a, b) => b.totalSeconds - a.totalSeconds);
}

/**
 * Format seconds into mm:ss or hh:mm:ss.
 */
export function formatTimerDisplay(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(safeSec / 3600);
  const mins = Math.floor((safeSec % 3600) / 60);
  const secs = safeSec % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format duration into human readable Arabic string.
 */
export function formatDurationArabic(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(safeSec / 3600);
  const mins = Math.floor((safeSec % 3600) / 60);

  if (hrs > 0 && mins > 0) {
    return `${hrs} س و ${mins} د`;
  }
  if (hrs > 0) {
    return `${hrs} ساعة`;
  }
  if (mins > 0) {
    return `${mins} دقيقة`;
  }
  return `${safeSec} ثانية`;
}
