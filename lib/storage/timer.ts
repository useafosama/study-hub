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
 * Get multi-week trend for the past 4 weeks.
 */
export function getWeeklyMultiWeekTrend(sessions: StudySessionRecord[]) {
  const now = new Date();
  const weeks: { label: string; rangeStr: string; seconds: number; isCurrent: boolean }[] = [];

  for (let i = 3; i >= 0; i--) {
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7 + 1).getTime();
    const start = end - 7 * 24 * 60 * 60 * 1000;

    const weekSessions = sessions.filter((s) => {
      const t = new Date(s.endTime || s.startTime).getTime();
      return t >= start && t < end;
    });

    const totalSeconds = weekSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const label =
      i === 0
        ? "الأسبوع الحالي"
        : i === 1
        ? "الأسبوع الماضي"
        : `قبل ${i} أسابيع`;

    const dStart = new Date(start);
    const dEnd = new Date(end - 1);
    const rangeStr = `${dStart.getDate()}/${dStart.getMonth() + 1} - ${dEnd.getDate()}/${dEnd.getMonth() + 1}`;

    weeks.push({
      label,
      rangeStr,
      seconds: totalSeconds,
      isCurrent: i === 0,
    });
  }

  return weeks;
}

/**
 * Get monthly trend for the past 6 months.
 */
export function getMonthlyStudyTrend(sessions: StudySessionRecord[]) {
  const now = new Date();
  const arabicMonths = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];
  const months: { label: string; yearMonth: string; seconds: number; isCurrent: boolean }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = d.getTime();
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();

    const monthSessions = sessions.filter((s) => {
      const t = new Date(s.endTime || s.startTime).getTime();
      return t >= monthStart && t < monthEnd;
    });

    const totalSeconds = monthSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const label = arabicMonths[d.getMonth()];
    const yearMonth = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;

    months.push({
      label,
      yearMonth,
      seconds: totalSeconds,
      isCurrent: i === 0,
    });
  }

  return months;
}

/**
 * Calculate study patterns from sessions.
 */
export function calculateStudyPatterns(sessions: StudySessionRecord[]) {
  if (!sessions || sessions.length < 2) {
    return {
      hasEnoughData: false,
      totalSessions: sessions?.length || 0,
      averageSessionDurationSeconds: sessions?.length === 1 ? sessions[0].duration : 0,
      mostActivePeriod: null,
      mostActiveDay: null,
      periodsBreakdown: [] as { name: string; count: number }[],
    };
  }

  const hourCounts = new Array(24).fill(0);
  const dayCounts = new Array(7).fill(0);
  let totalDuration = 0;

  sessions.forEach((s) => {
    totalDuration += s.duration || 0;
    const d = new Date(s.startTime || s.createdAt);
    if (!isNaN(d.getTime())) {
      const hr = d.getHours();
      hourCounts[hr] = (hourCounts[hr] || 0) + 1;
      const day = d.getDay();
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    }
  });

  const averageSessionDurationSeconds = Math.round(totalDuration / sessions.length);

  // Determine peak period
  const morningCount = hourCounts.slice(5, 12).reduce((a, b) => a + b, 0);
  const afternoonCount = hourCounts.slice(12, 17).reduce((a, b) => a + b, 0);
  const eveningCount = hourCounts.slice(17, 23).reduce((a, b) => a + b, 0);
  const nightCount = hourCounts[23] + hourCounts.slice(0, 5).reduce((a, b) => a + b, 0);

  const periods = [
    { name: "الفترة المسائية (5:00 م - 11:00 م)", count: eveningCount },
    { name: "فترة الظهيرة (12:00 م - 5:00 م)", count: afternoonCount },
    { name: "فترة الصباح (5:00 ص - 12:00 م)", count: morningCount },
    { name: "فترة الليل المتأخر (11:00 م - 5:00 ص)", count: nightCount },
  ];
  periods.sort((a, b) => b.count - a.count);
  const mostActivePeriod = periods[0].count > 0 ? periods[0].name : "أوقات متوازنة";

  // Determine peak day
  const arabicDays = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  let maxDayIdx = 0;
  for (let i = 1; i < 7; i++) {
    if (dayCounts[i] > dayCounts[maxDayIdx]) {
      maxDayIdx = i;
    }
  }
  const mostActiveDay = arabicDays[maxDayIdx];

  return {
    hasEnoughData: true,
    totalSessions: sessions.length,
    averageSessionDurationSeconds,
    mostActivePeriod,
    mostActiveDay,
    periodsBreakdown: periods,
  };
}

/**
 * Merge local sessions and server-side sessions without duplicate IDs.
 */
export function mergeStudySessions(
  localSessions: StudySessionRecord[],
  serverSessions: {
    id: string;
    courseId: string;
    courseName: string;
    courseCode: string;
    lectureTitle?: string | null;
    duration: number;
    startTime: string;
    endTime: string;
    completionStatus: string;
  }[]
): StudySessionRecord[] {
  const map = new Map<string, StudySessionRecord>();

  // Add server sessions
  serverSessions.forEach((s) => {
    map.set(s.id, {
      id: s.id,
      userId: "",
      courseId: s.courseId,
      courseName: s.courseName,
      courseCode: s.courseCode,
      lectureId: null,
      lectureTitle: s.lectureTitle,
      startTime: s.startTime,
      endTime: s.endTime,
      duration: s.duration,
      targetDuration: s.duration,
      completionStatus: s.completionStatus as "completed" | "early_finish",
      createdAt: new Date(s.startTime).getTime() || Date.now(),
    });
  });

  // Add / overwrite with local sessions (which may have richer details)
  localSessions.forEach((s) => {
    map.set(s.id, s);
  });

  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.endTime || b.startTime).getTime() - new Date(a.endTime || a.startTime).getTime()
  );
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
