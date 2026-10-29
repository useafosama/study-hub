"use client";

import * as React from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  CheckCircle2,
  Trophy,
  Flame,
  TrendingUp,
  BarChart3,
  BookOpen,
  ArrowUpRight,
  Sparkles,
  HelpCircle,
  PlayCircle,
  FileText,
  AlertCircle,
  Layers,
  Award,
  ChevronLeft,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  StudentAnalyticsData,
  RecentlyCompletedItem,
  EnrichedSubjectStats,
} from "@/actions/student";
import {
  StudySessionRecord,
  getStoredSessions,
  mergeStudySessions,
  getWeeklyMultiWeekTrend,
  getMonthlyStudyTrend,
  calculateStudyPatterns,
  formatDurationArabic,
} from "@/lib/storage/timer";
import { getGamificationState } from "@/lib/gamification/badges";
import { getStoredNotes } from "@/lib/storage/notes";
import { formatRelativeTime } from "@/lib/utils";

interface AnalyticsDashboardProps {
  initialData: StudentAnalyticsData;
}

export function AnalyticsDashboard({ initialData }: AnalyticsDashboardProps) {
  const [chartView, setChartView] = React.useState<"daily" | "weekly" | "monthly">("daily");
  const [allSessions, setAllSessions] = React.useState<StudySessionRecord[]>([]);
  const [streakDays, setStreakDays] = React.useState<number>(1);
  const [isClient, setIsClient] = React.useState(false);

  // Client hydration: merge local timer sessions with server study sessions
  React.useEffect(() => {
    setIsClient(true);
    const local = getStoredSessions(initialData.profile?.id);
    const merged = mergeStudySessions(local, initialData.serverStudySessions || []);
    setAllSessions(merged);

    // Gamification streak
    const notes = getStoredNotes();
    const gamification = getGamificationState({
      totalContents: initialData.totalContentsCount,
      completedContents: initialData.totalCompletedCount,
      notesCount: notes.length,
      subjectsCount: initialData.subjects.length,
      completedSubjectsCount: initialData.completedSubjectsCount,
    });
    setStreakDays(gamification.streakDays || 1);
  }, [initialData]);

  // Compute Time Aggregates (Today, This Week, Total)
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;
  const weekStart = todayStart - 6 * 24 * 60 * 60 * 1000;

  const totalStudySeconds = allSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const todayStudySeconds = allSessions
    .filter((s) => {
      const t = new Date(s.endTime || s.startTime).getTime();
      return t >= todayStart && t < todayEnd;
    })
    .reduce((acc, s) => acc + (s.duration || 0), 0);

  const weekStudySeconds = allSessions
    .filter((s) => {
      const t = new Date(s.endTime || s.startTime).getTime();
      return t >= weekStart && t < todayEnd;
    })
    .reduce((acc, s) => acc + (s.duration || 0), 0);

  // Group study time by course ID
  const courseStudySecondsMap = React.useMemo(() => {
    const map = new Map<string, number>();
    allSessions.forEach((s) => {
      if (s.courseId) {
        map.set(s.courseId, (map.get(s.courseId) || 0) + (s.duration || 0));
      }
    });
    return map;
  }, [allSessions]);

  // Daily Trend for the past 7 days
  const dailyTrend = React.useMemo(() => {
    const days: { dayName: string; dateStr: string; seconds: number; isToday: boolean }[] = [];
    const arabicDays = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const start = d.getTime();
      const end = start + 24 * 60 * 60 * 1000;

      const daySessions = allSessions.filter((s) => {
        const t = new Date(s.endTime || s.startTime).getTime();
        return t >= start && t < end;
      });

      const totalSec = daySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
      days.push({
        dayName: i === 0 ? "اليوم" : arabicDays[d.getDay()],
        dateStr: `${d.getDate()}/${d.getMonth() + 1}`,
        seconds: totalSec,
        isToday: i === 0,
      });
    }
    return days;
  }, [allSessions, now]);

  // Weekly Trend for the past 4 weeks
  const weeklyTrend = React.useMemo(() => {
    return getWeeklyMultiWeekTrend(allSessions);
  }, [allSessions]);

  // Monthly Trend for the past 6 months
  const monthlyTrend = React.useMemo(() => {
    return getMonthlyStudyTrend(allSessions);
  }, [allSessions]);

  // Study Patterns
  const studyPatterns = React.useMemo(() => {
    return calculateStudyPatterns(allSessions);
  }, [allSessions]);

  // Learning Performance Indicators:
  // 1. Best performing course (highest completion %)
  // 2. Weakest course / Needs Attention (lowest completion % among incomplete)
  // 3. Most completed course (highest total completed lectures)
  const { bestCourse, weakestCourse, mostCompletedCourse } = React.useMemo(() => {
    if (!initialData.subjects || initialData.subjects.length === 0) {
      return { bestCourse: null, weakestCourse: null, mostCompletedCourse: null };
    }

    const sortedByPercentage = [...initialData.subjects].sort(
      (a, b) => (b.progress_percentage || 0) - (a.progress_percentage || 0)
    );
    const sortedByCompleted = [...initialData.subjects].sort(
      (a, b) => (b.completed_contents || 0) - (a.completed_contents || 0)
    );

    const best = sortedByPercentage[0] || null;
    const incompleteCourses = [...initialData.subjects].filter(
      (s) => (s.progress_percentage || 0) < 100 && (s.total_contents || 0) > 0
    );
    incompleteCourses.sort(
      (a, b) => (a.progress_percentage || 0) - (b.progress_percentage || 0)
    );
    const weakest = incompleteCourses[0] || null;
    const mostCompleted = sortedByCompleted[0] || null;

    return {
      bestCourse: best,
      weakestCourse: weakest,
      mostCompletedCourse: mostCompleted,
    };
  }, [initialData.subjects]);

  // Quiz Performance Data Check
  const totalExams = initialData.subjects.reduce((acc, s) => acc + (s.exams_count || 0), 0);
  const completedExams = initialData.subjects.reduce(
    (acc, s) => acc + (s.completed_exams_count || 0),
    0
  );
  const hasQuizData = completedExams > 0;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>لوحة تحليلات التعلم المتقدمة</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            إحصائياتك ومسار تقدمك الأكاديمي 📊
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            رؤية بصرية شاملة لوقت مذاكرتك، نسب إنجاز المواد، وأنماط دراستك اليومية
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button asChild variant="outline" size="sm" className="rounded-2xl text-xs gap-1.5 h-10">
            <Link href="/dashboard">
              <BookOpen className="h-4 w-4" />
              <span>الرئيسية</span>
            </Link>
          </Button>
          <Button asChild variant="default" size="sm" className="rounded-2xl text-xs font-bold gap-1.5 h-10 shadow-xs">
            <Link href="/subjects">
              <span>متابعة المواد</span>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Grid (Apple Frosted Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Study Time */}
        <div className="glass-card-interactive p-4 sm:p-5 rounded-3xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">إجمالي وقت المذاكرة</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-500/10 text-primary border border-primary/20 shadow-xs">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-foreground">
              {formatDurationArabic(totalStudySeconds)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              جلسات تركيز موثقة
            </div>
          </div>
        </div>

        {/* Study Time Today */}
        <div className="glass-card-interactive p-4 sm:p-5 rounded-3xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">المذاكرة اليوم</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-foreground">
              {todayStudySeconds > 0 ? formatDurationArabic(todayStudySeconds) : "0 دقيقة"}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              هذا الأسبوع: {formatDurationArabic(weekStudySeconds)}
            </div>
          </div>
        </div>

        {/* Completed Lectures */}
        <div className="glass-card-interactive p-4 sm:p-5 rounded-3xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">الدروس المنجزة</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-xs">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-foreground">
              {initialData.totalCompletedCount}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                من {initialData.totalContentsCount}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {initialData.completedSubjectsCount} مواد مكتملة 100%
            </div>
          </div>
        </div>

        {/* Study Streak & Quiz Status */}
        <div className="glass-card-interactive p-4 sm:p-5 rounded-3xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">الالتزام المتتالي</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-1.5">
              <span>{streakDays}</span>
              <span className="text-xs font-bold text-amber-500">أيام متتالية 🔥</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {hasQuizData ? `أتممت ${completedExams} اختبارات` : "لم تُجرَ اختبارات بعد"}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Overall Progress Bar Card */}
      <Card className="rounded-3xl border border-border/70 bg-card/70 backdrop-blur-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <span>معدل إتقان المحتوى العام للمنصة</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              أنت أنجزت {initialData.totalCompletedCount} محتوى من إجمالي {initialData.totalContentsCount} محتوى دراسي مسند إليك
            </p>
          </div>
          <div className="text-left font-black text-2xl text-primary font-mono self-start sm:self-auto">
            {initialData.overallPercentage}%
          </div>
        </div>
        <Progress value={initialData.overallPercentage} className="h-3 rounded-full bg-secondary" />
      </Card>

      {/* 4. Study Time Interactive Chart (Daily / Weekly / Monthly) */}
      <Card className="rounded-3xl border border-border/80 bg-card/70 backdrop-blur-xl shadow-md overflow-hidden">
        <CardContent className="p-5 sm:p-7 space-y-6">
          {/* Chart Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  رسم بياني لساعات المذاكرة
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                توزيع ساعات المذاكرة بحسب الفترات الزمنية المختلفة
              </p>
            </div>

            {/* Timeframe Switcher Tabs */}
            <div className="inline-flex items-center p-1 rounded-2xl bg-secondary/60 border border-border/60 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setChartView("daily")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  chartView === "daily"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                يومي (7 أيام)
              </button>
              <button
                type="button"
                onClick={() => setChartView("weekly")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  chartView === "weekly"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                أسبوعي (4 أسابيع)
              </button>
              <button
                type="button"
                onClick={() => setChartView("monthly")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  chartView === "monthly"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                شهري (6 أشهر)
              </button>
            </div>
          </div>

          {/* Chart Rendering */}
          {chartView === "daily" && (
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2.5 sm:gap-4 h-56 items-end p-4 rounded-3xl bg-secondary/20 border border-border/40">
                {dailyTrend.map((item, idx) => {
                  const maxSec = Math.max(...dailyTrend.map((d) => d.seconds), 3600);
                  const heightPct = Math.max(6, Math.round((item.seconds / maxSec) * 100));

                  return (
                    <div
                      key={idx}
                      className="group flex flex-col items-center justify-end h-full gap-2 relative"
                    >
                      {/* Tooltip on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-popover text-popover-foreground text-[10px] font-bold px-2 py-1 rounded-xl shadow-md border border-border whitespace-nowrap pointer-events-none z-10">
                        {item.seconds > 0 ? formatDurationArabic(item.seconds) : "0 دقيقة"}
                      </div>

                      {/* Bar Pillar */}
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full max-w-[42px] rounded-xl sm:rounded-2xl transition-all duration-300 ${
                          item.isToday
                            ? "bg-gradient-to-t from-blue-600 to-indigo-500 shadow-sm shadow-blue-500/30"
                            : item.seconds > 0
                            ? "bg-primary/50 group-hover:bg-primary/70"
                            : "bg-muted/40"
                        }`}
                      />

                      {/* Day Label */}
                      <div className="text-center">
                        <span
                          className={`block text-[11px] sm:text-xs font-bold truncate ${
                            item.isToday ? "text-primary font-black" : "text-muted-foreground"
                          }`}
                        >
                          {item.dayName}
                        </span>
                        <span className="block text-[9px] text-muted-foreground/70 font-mono">
                          {item.dateStr}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
                <span>ملاحظة: البيانات تتحدث فورياً مع كل جلسة يتم حفظها بالمؤقت الذكي</span>
                <span className="font-bold text-foreground">
                  مجموع الأيام السبعة: {formatDurationArabic(weekStudySeconds)}
                </span>
              </div>
            </div>
          )}

          {chartView === "weekly" && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3 sm:gap-6 h-56 items-end p-4 rounded-3xl bg-secondary/20 border border-border/40">
                {weeklyTrend.map((item, idx) => {
                  const maxSec = Math.max(...weeklyTrend.map((w) => w.seconds), 3600 * 2);
                  const heightPct = Math.max(6, Math.round((item.seconds / maxSec) * 100));

                  return (
                    <div
                      key={idx}
                      className="group flex flex-col items-center justify-end h-full gap-2 relative"
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-popover text-popover-foreground text-[10px] font-bold px-2 py-1 rounded-xl shadow-md border border-border whitespace-nowrap pointer-events-none z-10">
                        {item.seconds > 0 ? formatDurationArabic(item.seconds) : "0 دقيقة"}
                      </div>

                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full max-w-[60px] rounded-xl sm:rounded-2xl transition-all duration-300 ${
                          item.isCurrent
                            ? "bg-gradient-to-t from-blue-600 to-indigo-500 shadow-sm shadow-blue-500/30"
                            : item.seconds > 0
                            ? "bg-primary/50 group-hover:bg-primary/70"
                            : "bg-muted/40"
                        }`}
                      />

                      <div className="text-center">
                        <span
                          className={`block text-[11px] sm:text-xs font-bold truncate ${
                            item.isCurrent ? "text-primary font-black" : "text-muted-foreground"
                          }`}
                        >
                          {item.label}
                        </span>
                        <span className="block text-[9px] text-muted-foreground/70 font-mono">
                          {item.rangeStr}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {chartView === "monthly" && (
            <div className="space-y-4">
              <div className="grid grid-cols-6 gap-2.5 sm:gap-4 h-56 items-end p-4 rounded-3xl bg-secondary/20 border border-border/40">
                {monthlyTrend.map((item, idx) => {
                  const maxSec = Math.max(...monthlyTrend.map((m) => m.seconds), 3600 * 5);
                  const heightPct = Math.max(6, Math.round((item.seconds / maxSec) * 100));

                  return (
                    <div
                      key={idx}
                      className="group flex flex-col items-center justify-end h-full gap-2 relative"
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-popover text-popover-foreground text-[10px] font-bold px-2 py-1 rounded-xl shadow-md border border-border whitespace-nowrap pointer-events-none z-10">
                        {item.seconds > 0 ? formatDurationArabic(item.seconds) : "0 دقيقة"}
                      </div>

                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full max-w-[50px] rounded-xl sm:rounded-2xl transition-all duration-300 ${
                          item.isCurrent
                            ? "bg-gradient-to-t from-blue-600 to-indigo-500 shadow-sm shadow-blue-500/30"
                            : item.seconds > 0
                            ? "bg-primary/50 group-hover:bg-primary/70"
                            : "bg-muted/40"
                        }`}
                      />

                      <div className="text-center">
                        <span
                          className={`block text-[11px] sm:text-xs font-bold truncate ${
                            item.isCurrent ? "text-primary font-black" : "text-muted-foreground"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Course Progress Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>مستوى التقدم في المواد الدراسية</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              نسبة إنجاز المحاضرات وساعات المذاكرة المقضاة لكل مادة
            </p>
          </div>
          <Badge variant="secondary" className="text-xs font-bold">
            {initialData.subjects.length} مواد مسندة
          </Badge>
        </div>

        {initialData.subjects.length === 0 ? (
          <Card className="rounded-3xl border border-dashed border-border/80 p-8 text-center bg-card/50">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-secondary text-muted-foreground mb-3">
              <BookOpen className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-foreground">لا توجد مواد مسندة إليك حالياً</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              سيتواصل معك المشرف لتخصيص المواد الدراسية المناسبة لحسابك لتبدأ في تتبع تقدمك
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initialData.subjects.map((subject) => {
              const studiedSecs = courseStudySecondsMap.get(subject.id) || 0;
              const hasExams = (subject.exams_count || 0) > 0;

              return (
                <Card
                  key={subject.id}
                  className="rounded-3xl border border-border/70 bg-card/70 backdrop-blur-xl hover:border-primary/40 transition-all p-5 space-y-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/subjects/${subject.id}`}
                          className="font-black text-base text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                          <span>{subject.name}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                        </Link>
                      </div>
                      {subject.code && (
                        <span className="font-mono text-[10px] text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md">
                          {subject.code}
                        </span>
                      )}
                    </div>

                    <div className="text-left">
                      <span className="font-black text-lg text-primary font-mono">
                        {subject.progress_percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <Progress
                    value={subject.progress_percentage}
                    className="h-2 rounded-full bg-secondary"
                  />

                  {/* Course Details Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">المنجز</span>
                      <span className="font-bold text-foreground">
                        {subject.completed_contents} / {subject.total_contents}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">المتبقي</span>
                      <span className="font-bold text-muted-foreground">
                        {subject.remaining_contents} درس
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">وقت المذاكرة</span>
                      <span className="font-bold text-primary font-mono">
                        {studiedSecs > 0 ? formatDurationArabic(studiedSecs) : "0 د"}
                      </span>
                    </div>
                  </div>

                  {/* Quiz Performance Info */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-muted-foreground">حالة الاختبارات:</span>
                    {hasExams ? (
                      <Badge variant="outline" className="text-[10px] bg-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-500/20">
                        {subject.completed_exams_count} من {subject.exams_count} اختبار مجتاز
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground/70">محتوى دراسي (لا توجد اختبارات)</span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Learning Performance & Patterns Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Learning Performance Insights (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span>مؤشرات الأداء الدراسي والتميز</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Best Performing Course */}
            <div className="p-4 rounded-3xl bg-secondary/40 border border-border/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">أعلى مادة في الإنجاز</span>
                <span className="text-amber-500 text-xs">🥇</span>
              </div>
              {bestCourse ? (
                <div>
                  <div className="text-sm font-black text-foreground truncate">
                    {bestCourse.name}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                    {bestCourse.progress_percentage}% مكتمل ({bestCourse.completed_contents} درس)
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">لا تتوفر مواد كافية</div>
              )}
            </div>

            {/* Course Needing Attention */}
            <div className="p-4 rounded-3xl bg-secondary/40 border border-border/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">تحتاج لاهتمام إضافي</span>
                <span className="text-primary text-xs">🎯</span>
              </div>
              {weakestCourse ? (
                <div>
                  <div className="text-sm font-black text-foreground truncate">
                    {weakestCourse.name}
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1">
                    {weakestCourse.remaining_contents} درس متبقي للمذاكرة
                  </div>
                </div>
              ) : (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  جميع المواد مكتملة بنجاح 🎉
                </div>
              )}
            </div>

            {/* Most Completed Course */}
            <div className="p-4 rounded-3xl bg-secondary/40 border border-border/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">الأكثر إنجازاً بالمحاضرات</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              {mostCompletedCourse && mostCompletedCourse.completed_contents > 0 ? (
                <div>
                  <div className="text-sm font-black text-foreground truncate">
                    {mostCompletedCourse.name}
                  </div>
                  <div className="text-xs text-muted-foreground font-semibold mt-1">
                    أتممت {mostCompletedCourse.completed_contents} محاضرة وسكشن
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">ابدأ بإكمال أول درس لتسجيل تفوقك</div>
              )}
            </div>

            {/* Quiz Evaluation Status */}
            <div className="p-4 rounded-3xl bg-secondary/40 border border-border/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">تقييم الاختبارات والامتحانات</span>
                <GraduationCap className="h-4 w-4 text-purple-500" />
              </div>
              {hasQuizData ? (
                <div>
                  <div className="text-sm font-black text-foreground">
                    تم اجتياز {completedExams} من {totalExams} امتحان
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                    أداء ممتاز ومكتمل
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs font-bold text-muted-foreground">
                    لم تُجرَ اختبارات تقييمية بعد
                  </div>
                  <div className="text-[10px] text-muted-foreground/80 mt-1">
                    ستظهر النتائج فور إتاحة الامتحانات التفاعلية
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Study Patterns (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>أنماط وسلوك المذاكرة</span>
            </h3>
          </div>

          {studyPatterns.hasEnoughData ? (
            <div className="p-5 rounded-3xl bg-secondary/40 border border-border/70 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-border/50">
                  <span className="text-muted-foreground">ساعات الذروة والإنتاجية:</span>
                  <span className="font-bold text-foreground">{studyPatterns.mostActivePeriod}</span>
                </div>

                <div className="flex items-center justify-between text-xs pb-2 border-b border-border/50">
                  <span className="text-muted-foreground">اليوم الأكثر نشاطاً:</span>
                  <span className="font-bold text-primary font-black">
                    يوم {studyPatterns.mostActiveDay}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pb-2 border-b border-border/50">
                  <span className="text-muted-foreground">متوسط مدة الجلسة:</span>
                  <span className="font-bold text-foreground">
                    {formatDurationArabic(studyPatterns.averageSessionDurationSeconds)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">إجمالي الجلسات المسجلة:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {studyPatterns.totalSessions} جلسات
                  </span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-muted-foreground/80 leading-relaxed bg-background/50 p-3 rounded-2xl border border-border/50">
                💡 استمرارك في المذاكرة في أوقات الذروة المحددة يعزز من قدرتك على الحفظ والاستيعاب السريع.
              </div>
            </div>
          ) : (
            <Card className="rounded-3xl border border-dashed border-border/80 p-6 text-center bg-card/40 flex flex-col items-center justify-center space-y-2 h-[210px]">
              <HelpCircle className="h-8 w-8 text-muted-foreground/60" />
              <h5 className="text-xs font-bold text-foreground">
                تحتاج لإكمال جلستي مذاكرة على الأقل
              </h5>
              <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                يقوم النظام بتحليل أوقات ذروتك وأيامك الأكثر إنتاجية تلقائياً بمجرد استخدام مؤقت المذاكرة
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* 7. Recently Completed Content List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span>المحتوى والدروس المكتملة مؤخراً</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              سجل تفصيلي لآخر الدروس والمحاضرات التي أتممت دراستها
            </p>
          </div>
        </div>

        {initialData.recentlyCompletedContents.length === 0 ? (
          <Card className="rounded-3xl border border-dashed border-border/80 p-8 text-center bg-card/40">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-secondary text-muted-foreground mb-3">
              <PlayCircle className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-foreground">لم تقم بإكمال أي دروس حتى الآن</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              عند فتح المحاضرات والضغط على «تحديد كمكتمل»، ستظهر هنا كافة إنجازاتك الدراسية بتواريخها الدقيقة
            </p>
            <Button asChild size="sm" className="mt-4 rounded-2xl text-xs font-bold">
              <Link href="/subjects">تصفح المحاضرات الآن</Link>
            </Button>
          </Card>
        ) : (
          <div className="rounded-3xl border border-border/70 bg-card/70 backdrop-blur-xl overflow-hidden divide-y divide-border/60">
            {initialData.recentlyCompletedContents.map((item) => (
              <div
                key={item.contentId}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <Link
                      href={`/content/${item.contentId}`}
                      className="font-bold text-xs sm:text-sm text-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {item.contentTitle}
                    </Link>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{item.subjectName}</span>
                      {item.subjectCode && <span>• {item.subjectCode}</span>}
                      <span>•</span>
                      <Badge variant="outline" className="text-[10px] py-0 px-2">
                        {item.contentType === "lecture"
                          ? "محاضرة"
                          : item.contentType === "section"
                          ? "سكشن"
                          : item.contentType === "exam"
                          ? "امتحان"
                          : "ملخص"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="text-left self-end sm:self-auto text-[11px] text-muted-foreground">
                  {formatRelativeTime(item.completedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
