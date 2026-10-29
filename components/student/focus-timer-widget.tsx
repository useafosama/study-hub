"use client";

import * as React from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Maximize2,
  Clock,
  Target,
  BarChart3,
  BookOpen,
  ChevronDown,
  Flame,
  Volume2,
  VolumeX,
  Calendar,
  Layers,
  Settings2,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  TIMER_PRESETS,
  StudySessionRecord,
  ActiveTimerState,
  getStoredSessions,
  saveCompletedSession,
  getActiveSession,
  saveActiveSession,
  clearActiveSession,
  getDailyGoalMinutes,
  setDailyGoalMinutes,
  getTodayStudyStats,
  getWeeklyStudyTrend,
  getCourseBreakdown,
  formatTimerDisplay,
  formatDurationArabic,
} from "@/lib/storage/timer";
import { playTimerCompletionChime } from "@/lib/audio/chime";
import { recordStudySessionAction } from "@/actions/student";
import { FocusModeModal } from "./focus-mode-modal";

export interface SubjectOption {
  id: string;
  name: string;
  code: string;
}

interface FocusTimerWidgetProps {
  subjects?: SubjectOption[];
  initialSubjectId?: string;
  initialSubjectName?: string;
  initialSubjectCode?: string;
  initialLectureId?: string;
  initialLectureTitle?: string;
  userId?: string;
}

export function FocusTimerWidget({
  subjects = [],
  initialSubjectId,
  initialSubjectName,
  initialSubjectCode,
  initialLectureId,
  initialLectureTitle,
  userId,
}: FocusTimerWidgetProps) {
  // Preset or custom target duration in seconds
  const [selectedMinutes, setSelectedMinutes] = React.useState<number>(25);
  const [customInputMinutes, setCustomInputMinutes] = React.useState<string>("45");
  const [isCustomDialogOpen, setIsCustomDialogOpen] = React.useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = React.useState(false);
  const [goalInputMinutes, setGoalInputMinutes] = React.useState<string>("120");

  // Selected subject & lecture
  const [selectedSubject, setSelectedSubject] = React.useState<SubjectOption>(() => {
    if (initialSubjectId && initialSubjectName) {
      return {
        id: initialSubjectId,
        name: initialSubjectName,
        code: initialSubjectCode || "",
      };
    }
    if (subjects.length > 0) {
      return subjects[0];
    }
    return { id: "general", name: "مذاكرة حرة عامة", code: "GENERAL" };
  });

  const [lectureTitle, setLectureTitle] = React.useState<string | null>(
    initialLectureTitle || null
  );
  const [lectureId, setLectureId] = React.useState<string | null>(
    initialLectureId || null
  );

  // Timer Core State
  const [remainingSeconds, setRemainingSeconds] = React.useState<number>(25 * 60);
  const [totalDurationSeconds, setTotalDurationSeconds] = React.useState<number>(25 * 60);
  const [isRunning, setIsRunning] = React.useState(false);
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [sessionStartTime, setSessionStartTime] = React.useState<string | null>(null);

  // Focus Mode Overlay
  const [isFocusModeOpen, setIsFocusModeOpen] = React.useState(false);
  // View Analytics Tab
  const [showAnalytics, setShowAnalytics] = React.useState(false);

  // Sound chime enable toggle
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  // Statistics state
  const [stats, setStats] = React.useState(() => getTodayStudyStats(userId));
  const [weeklyTrend, setWeeklyTrend] = React.useState(() => getWeeklyStudyTrend(userId));
  const [courseStats, setCourseStats] = React.useState(() => getCourseBreakdown(userId));

  // Ref to track if session is being finished to avoid double-processing
  const isSavingRef = React.useRef(false);

  // Refresh stats helper
  const refreshStats = React.useCallback(() => {
    setStats(getTodayStudyStats(userId));
    setWeeklyTrend(getWeeklyStudyTrend(userId));
    setCourseStats(getCourseBreakdown(userId));
  }, [userId]);

  // Restore active session on mount
  React.useEffect(() => {
    const active = getActiveSession();
    if (active) {
      const remaining = Math.max(0, active.targetDurationSeconds - active.elapsedFocusSeconds);
      setTotalDurationSeconds(active.targetDurationSeconds);
      setSelectedMinutes(Math.round(active.targetDurationSeconds / 60));
      setRemainingSeconds(remaining);
      setIsRunning(active.isRunning);
      setSessionStartTime(active.startTime);

      if (active.courseId) {
        setSelectedSubject({
          id: active.courseId,
          name: active.courseName,
          code: active.courseCode,
        });
      }
      if (active.lectureTitle) {
        setLectureTitle(active.lectureTitle);
        setLectureId(active.lectureId || null);
      }

      if (remaining === 0) {
        setIsCompleted(true);
        setIsRunning(false);
      }
    }
    refreshStats();
  }, [refreshStats]);

  // Sync active state to localStorage whenever it changes
  React.useEffect(() => {
    if (isRunning || (remainingSeconds < totalDurationSeconds && remainingSeconds > 0)) {
      const activeState: ActiveTimerState = {
        courseId: selectedSubject.id,
        courseName: selectedSubject.name,
        courseCode: selectedSubject.code,
        lectureId,
        lectureTitle,
        targetDurationSeconds: totalDurationSeconds,
        elapsedFocusSeconds: totalDurationSeconds - remainingSeconds,
        isRunning,
        startTime: sessionStartTime || new Date().toISOString(),
        lastTickTimestamp: Date.now(),
      };
      saveActiveSession(activeState);
    } else if (remainingSeconds === totalDurationSeconds && !isRunning) {
      clearActiveSession();
    }
  }, [
    isRunning,
    remainingSeconds,
    totalDurationSeconds,
    selectedSubject,
    lectureId,
    lectureTitle,
    sessionStartTime,
  ]);

  // Record completed session
  const handleSessionCompletion = React.useCallback(
    async (status: "completed" | "early_finish", actualFocusedSecs: number) => {
      if (isSavingRef.current || actualFocusedSecs < 10) {
        // Ignore less than 10 seconds to avoid accidental clutter
        clearActiveSession();
        return;
      }
      isSavingRef.current = true;

      const now = new Date();
      const startTime = sessionStartTime || new Date(now.getTime() - actualFocusedSecs * 1000).toISOString();
      const endTime = now.toISOString();
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const sessionRecord: StudySessionRecord = {
        id: sessionId,
        userId: userId || "",
        courseId: selectedSubject.id,
        courseName: selectedSubject.name,
        courseCode: selectedSubject.code,
        lectureId,
        lectureTitle,
        startTime,
        endTime,
        duration: actualFocusedSecs,
        targetDuration: totalDurationSeconds,
        completionStatus: status,
        createdAt: Date.now(),
      };

      // 1. Local persistence
      saveCompletedSession(sessionRecord);
      clearActiveSession();
      refreshStats();

      // 2. Play chime
      if (soundEnabled) {
        playTimerCompletionChime();
      }

      // 3. User feedback
      const formattedDuration = formatDurationArabic(actualFocusedSecs);
      if (status === "completed") {
        toast.success(`أحسنت! أتممت جلسة مذاكرة مدتها ${formattedDuration} 🎉`, {
          description: `المادة: ${selectedSubject.name}`,
        });
      } else {
        toast.info(`تم إنهاء وحفظ جلسة المذاكرة (${formattedDuration}) ✓`);
      }

      // 4. Server action sync
      try {
        await recordStudySessionAction({
          sessionId,
          courseId: selectedSubject.id,
          courseName: selectedSubject.name,
          courseCode: selectedSubject.code,
          lectureId,
          lectureTitle,
          startTime,
          endTime,
          duration: actualFocusedSecs,
          targetDuration: totalDurationSeconds,
          completionStatus: status,
        });
      } catch (err) {
        console.error("Failed to sync study session to server:", err);
      } finally {
        isSavingRef.current = false;
      }
    },
    [
      sessionStartTime,
      userId,
      selectedSubject,
      lectureId,
      lectureTitle,
      totalDurationSeconds,
      refreshStats,
      soundEnabled,
    ]
  );

  // Interval ticker
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            setIsRunning(false);
            setIsCompleted(true);
            handleSessionCompletion("completed", totalDurationSeconds);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, remainingSeconds, totalDurationSeconds, handleSessionCompletion]);

  // Controls
  const handleTogglePlay = () => {
    if (isCompleted) {
      handleReset();
      return;
    }

    if (!isRunning) {
      if (!sessionStartTime) {
        setSessionStartTime(new Date().toISOString());
      }
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setRemainingSeconds(selectedMinutes * 60);
    setTotalDurationSeconds(selectedMinutes * 60);
    setSessionStartTime(null);
    clearActiveSession();
  };

  const handleFinishEarly = () => {
    const elapsed = totalDurationSeconds - remainingSeconds;
    if (elapsed < 10) {
      toast.error("مدة الجلسة قصيرة جداً للحفظ (أقل من 10 ثوانٍ)");
      handleReset();
      return;
    }
    setIsRunning(false);
    handleSessionCompletion("early_finish", elapsed);
    setRemainingSeconds(selectedMinutes * 60);
    setTotalDurationSeconds(selectedMinutes * 60);
    setSessionStartTime(null);
  };

  const handleSelectPreset = (minutes: number) => {
    if (isRunning) {
      toast.warning("يرجى إيقاف المؤقت أو إعادة ضبطه لتغيير المدة");
      return;
    }
    setSelectedMinutes(minutes);
    setRemainingSeconds(minutes * 60);
    setTotalDurationSeconds(minutes * 60);
    setIsCompleted(false);
    setSessionStartTime(null);
  };

  const handleApplyCustomMinutes = () => {
    const mins = parseInt(customInputMinutes, 10);
    if (isNaN(mins) || mins < 1 || mins > 360) {
      toast.error("يرجى إدخال مدة صحيحة بين دقيقة و 360 دقيقة");
      return;
    }
    handleSelectPreset(mins);
    setIsCustomDialogOpen(false);
  };

  const handleSaveGoal = () => {
    const mins = parseInt(goalInputMinutes, 10);
    if (isNaN(mins) || mins < 15 || mins > 720) {
      toast.error("يرجى إدخال هدف يومي واقعي بين 15 دقيقة و 12 ساعة");
      return;
    }
    setDailyGoalMinutes(mins);
    refreshStats();
    setIsGoalDialogOpen(false);
    toast.success("تم تحديث هدف المذاكرة اليومي 🎯");
  };

  // Progress ratio
  const progressRatio =
    totalDurationSeconds > 0
      ? Math.max(0, Math.min(1, 1 - remainingSeconds / totalDurationSeconds))
      : 0;

  const circumference = 2 * Math.PI * 56; // Radius = 56
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <>
      <Card className="rounded-3xl border border-border/80 bg-card/70 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        <CardContent className="p-5 sm:p-7 space-y-6">
          {/* Header Row: Title, Preset Switcher, Distraction-Free Trigger */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-foreground">
                    مؤقت التركيز الذكي
                  </h3>
                  <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                    Smart Study Timer
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  تتبع جلسات مذاكرتك بأسلوب بومودورو وراقب إنتاجيتك اليومية
                </p>
              </div>
            </div>

            {/* Quick Actions (Sound, Analytics Toggle, Full Focus Mode) */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSoundEnabled((prev) => !prev)}
                title={soundEnabled ? "كتم صوت الإتمام" : "تشغيل صوت الإتمام"}
                className="rounded-xl h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>

              <Button
                variant={showAnalytics ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowAnalytics((prev) => !prev)}
                className="rounded-xl text-xs gap-1.5 h-9"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>{showAnalytics ? "إخفاء التحليلات" : "التحليلات"}</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() => setIsFocusModeOpen(true)}
                className="rounded-xl text-xs font-bold gap-1.5 h-9 bg-primary/90 hover:bg-primary shadow-xs"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>وضع التركيز الكامل</span>
              </Button>
            </div>
          </div>

          {/* Context Selector: Course & Lecture Selection */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>المادة المستهدفة:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 rounded-xl px-2.5 text-xs font-bold text-foreground bg-background/60 hover:bg-background border border-border/60"
                  >
                    <span>{selectedSubject.name}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 rounded-2xl">
                  {subjects.map((s) => (
                    <DropdownMenuItem
                      key={s.id}
                      onClick={() => setSelectedSubject(s)}
                      className="cursor-pointer font-medium text-xs py-2"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{s.name}</span>
                        {s.code && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {s.code}
                          </span>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem
                    onClick={() =>
                      setSelectedSubject({
                        id: "general",
                        name: "مذاكرة حرة عامة",
                        code: "GENERAL",
                      })
                    }
                    className="cursor-pointer font-medium text-xs py-2 border-t border-border/50 text-primary"
                  >
                    <span>مذاكرة حرة عامة</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {lectureTitle ? (
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 truncate max-w-xs">
                <span className="font-semibold text-foreground">الدرس:</span>
                <span className="truncate">{lectureTitle}</span>
              </div>
            ) : (
              <div className="text-[11px] text-muted-foreground font-normal">
                جلسة تركيز مفتوحة
              </div>
            )}
          </div>

          {/* Center Timer Controls & Circular Progress */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Presets Column */}
            <div className="md:col-span-3 flex flex-row md:flex-col gap-2 overflow-x-auto pb-1 md:pb-0">
              {TIMER_PRESETS.map((p) => {
                const isActive = selectedMinutes === p.minutes;
                return (
                  <button
                    key={p.minutes}
                    type="button"
                    onClick={() => handleSelectPreset(p.minutes)}
                    className={`flex-1 md:flex-none p-3 rounded-2xl text-right transition-all border cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]"
                        : "bg-secondary/40 hover:bg-secondary/80 text-foreground border-border/60"
                    }`}
                  >
                    <div className="text-xs font-black">{p.label}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                      }`}
                    >
                      {p.sublabel}
                    </div>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setIsCustomDialogOpen(true)}
                className={`flex-1 md:flex-none p-3 rounded-2xl text-right transition-all border cursor-pointer ${
                  !TIMER_PRESETS.some((p) => p.minutes === selectedMinutes)
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]"
                    : "bg-secondary/40 hover:bg-secondary/80 text-foreground border-border/60"
                }`}
              >
                <div className="text-xs font-black">
                  {!TIMER_PRESETS.some((p) => p.minutes === selectedMinutes)
                    ? `${selectedMinutes} دقيقة`
                    : "تخصيص مدة"}
                </div>
                <div
                  className={`text-[10px] mt-0.5 ${
                    !TIMER_PRESETS.some((p) => p.minutes === selectedMinutes)
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  }`}
                >
                  حدد المدة المناسبة لك
                </div>
              </button>
            </div>

            {/* Circular Timer Display */}
            <div className="md:col-span-6 flex flex-col items-center justify-center text-center py-2">
              <div className="relative flex items-center justify-center">
                <svg className="w-48 h-48 sm:w-56 sm:h-56 -rotate-90 transform" viewBox="0 0 130 130">
                  <circle
                    cx="65"
                    cy="65"
                    r="56"
                    className="stroke-secondary"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  <circle
                    cx="65"
                    cy="65"
                    r="56"
                    className={`transition-all duration-500 ease-linear ${
                      isCompleted ? "stroke-emerald-500" : "stroke-primary"
                    }`}
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-foreground tabular-nums">
                    {formatTimerDisplay(remainingSeconds)}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isRunning ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                      }`}
                    />
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {isCompleted
                        ? "أحسنت! اكتملت الجلسة"
                        : isRunning
                        ? "جاري المذاكرة"
                        : "مؤقت متوقف"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Play/Pause, Reset, Finish Early */}
              <div className="flex items-center gap-2 mt-5">
                <Button
                  onClick={handleTogglePlay}
                  size="default"
                  className={`rounded-2xl px-6 h-11 font-black shadow-md transition-all active:scale-95 ${
                    isRunning
                      ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-4 w-4 fill-current ml-1.5" />
                      <span>إيقاف مؤقت</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current ml-1.5" />
                      <span>
                        {remainingSeconds < totalDurationSeconds ? "استئناف" : "بدء الجلسة"}
                      </span>
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleReset}
                  className="rounded-2xl h-11 w-11 border-border/80 bg-secondary/40 hover:bg-secondary text-foreground shadow-xs"
                  title="إعادة ضبط المؤقت"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>

                {remainingSeconds < totalDurationSeconds && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFinishEarly}
                    className="rounded-2xl h-11 px-3.5 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs gap-1 shadow-xs"
                    title="إنهاء الجلسة وحفظ الإنجاز"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>إنهاء وحفظ</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Daily Goal & Progress Column */}
            <div className="md:col-span-3 space-y-3.5 p-4 rounded-3xl bg-secondary/30 border border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Target className="h-4 w-4 text-primary" />
                  <span>الهدف اليومي</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setGoalInputMinutes(stats.dailyGoalMinutes.toString());
                    setIsGoalDialogOpen(true);
                  }}
                  className="h-6 w-6 rounded-lg text-muted-foreground hover:text-foreground"
                  title="تعديل الهدف اليومي"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-foreground">
                    {stats.todayMinutes} <span className="text-xs font-normal text-muted-foreground">دقيقة</span>
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    من {stats.dailyGoalMinutes} دقيقة
                  </span>
                </div>
                <Progress value={stats.progressPercentage} className="h-2 mt-2 bg-secondary" />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5">
                  <span>نسبة الإنجاز: {stats.progressPercentage}%</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {stats.sessionsCount} جلسات اليوم
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">إجمالي الساعات اليوم:</span>
                <span className="font-bold text-foreground dir-ltr">
                  {stats.todayHoursFormatted} hrs
                </span>
              </div>
            </div>
          </div>

          {/* Collapsible Analytics Section */}
          {showAnalytics && (
            <div className="pt-4 border-t border-border/60 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span>تحليلات المذاكرة للأيام السبعة الماضية</span>
                </h4>
                <div className="flex items-center gap-2">
                  <Link
                    href="/analytics"
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>لوحة التحليلات الكاملة</span>
                    <ArrowLeft className="h-3 w-3" />
                  </Link>
                  <Badge variant="secondary" className="text-[10px]">
                    محدث لحظياً
                  </Badge>
                </div>
              </div>

              {/* Weekly Mini Bars Chart */}
              <div className="grid grid-cols-7 gap-2 h-28 items-end p-3 rounded-2xl bg-secondary/30 border border-border/50">
                {weeklyTrend.map((day, idx) => {
                  const maxSecs = Math.max(
                    ...weeklyTrend.map((d) => d.seconds),
                    stats.dailyGoalMinutes * 60,
                    1
                  );
                  const heightPct = Math.max(8, Math.round((day.seconds / maxSecs) * 100));
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full max-w-[28px] rounded-lg transition-all duration-300 ${
                          day.isToday
                            ? "bg-primary shadow-xs shadow-primary/30"
                            : day.seconds > 0
                            ? "bg-primary/40 hover:bg-primary/60"
                            : "bg-muted/40"
                        }`}
                        title={`${day.dayName}: ${formatDurationArabic(day.seconds)}`}
                      />
                      <span
                        className={`text-[10px] font-bold truncate ${
                          day.isToday ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {day.dayName}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Subject Breakdown List */}
              {courseStats.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-muted-foreground">
                    توزيع وقت المذاكرة حسب المادة:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {courseStats.slice(0, 6).map((c) => (
                      <div
                        key={c.courseId}
                        className="p-3 rounded-2xl bg-secondary/40 border border-border/60 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5 truncate max-w-[130px]">
                          <div className="font-bold text-foreground truncate">{c.courseName}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {c.sessionCount} جلسات
                          </div>
                        </div>
                        <span className="font-mono font-bold text-primary">
                          {formatDurationArabic(c.totalSeconds)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Focus Mode Fullscreen Modal */}
      <FocusModeModal
        isOpen={isFocusModeOpen}
        courseName={selectedSubject.name}
        courseCode={selectedSubject.code}
        lectureTitle={lectureTitle}
        remainingSeconds={remainingSeconds}
        totalDurationSeconds={totalDurationSeconds}
        isRunning={isRunning}
        isCompleted={isCompleted}
        onTogglePlay={handleTogglePlay}
        onReset={handleReset}
        onFinishEarly={handleFinishEarly}
        onClose={() => setIsFocusModeOpen(false)}
      />

      {/* Custom Duration Dialog */}
      <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
        <DialogContent className="max-w-xs rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              تحديد مدة الجلسة المخصصة
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              أدخل عدد الدقائق المناسبة لجلسة تركيزك (مثلاً 40 أو 60 دقيقة)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max="360"
                value={customInputMinutes}
                onChange={(e) => setCustomInputMinutes(e.target.value)}
                placeholder="45"
                className="rounded-xl text-center font-bold text-lg font-mono"
              />
              <span className="text-sm font-bold text-muted-foreground">دقيقة</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCustomDialogOpen(false)}
                className="flex-1 rounded-xl text-xs"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleApplyCustomMinutes}
                className="flex-1 rounded-xl text-xs font-bold bg-primary text-primary-foreground"
              >
                تطبيق المدة
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Daily Goal Dialog */}
      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent className="max-w-xs rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              تعديل هدف المذاكرة اليومي
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              حدد إجمالي وقت المذاكرة الذي تطمح للوصول إليه يومياً بالدقائق
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="15"
                max="720"
                step="15"
                value={goalInputMinutes}
                onChange={(e) => setGoalInputMinutes(e.target.value)}
                placeholder="120"
                className="rounded-xl text-center font-bold text-lg font-mono"
              />
              <span className="text-sm font-bold text-muted-foreground">دقيقة</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsGoalDialogOpen(false)}
                className="flex-1 rounded-xl text-xs"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSaveGoal}
                className="flex-1 rounded-xl text-xs font-bold bg-primary text-primary-foreground"
              >
                حفظ الهدف
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
