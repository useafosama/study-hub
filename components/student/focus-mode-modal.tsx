"use client";

import * as React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  X,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTimerDisplay } from "@/lib/storage/timer";
import { playTimerCompletionChime } from "@/lib/audio/chime";

interface FocusModeModalProps {
  isOpen: boolean;
  courseName: string;
  courseCode?: string;
  lectureTitle?: string | null;
  remainingSeconds: number;
  totalDurationSeconds: number;
  isRunning: boolean;
  isCompleted: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onFinishEarly: () => void;
  onClose: () => void;
}

export function FocusModeModal({
  isOpen,
  courseName,
  courseCode,
  lectureTitle,
  remainingSeconds,
  totalDurationSeconds,
  isRunning,
  isCompleted,
  onTogglePlay,
  onReset,
  onFinishEarly,
  onClose,
}: FocusModeModalProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  // Handle Fullscreen toggle
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (e) {
      console.debug("Fullscreen toggle error:", e);
    }
  };

  // Listen to escape key or fullscreen change
  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
    };
  }, []);

  // Play chime on completion
  React.useEffect(() => {
    if (isCompleted && soundEnabled) {
      playTimerCompletionChime();
    }
  }, [isCompleted, soundEnabled]);

  if (!isOpen) return null;

  // Calculate circular progress
  const progressRatio =
    totalDurationSeconds > 0
      ? Math.max(0, Math.min(1, 1 - remainingSeconds / totalDurationSeconds))
      : 0;

  const circumference = 2 * Math.PI * 130; // Radius = 130
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="وضع التركيز الكامل"
      className="fixed inset-0 z-[100] flex flex-col justify-between p-6 sm:p-10 bg-background/95 backdrop-blur-2xl text-foreground select-none overflow-hidden animate-in fade-in duration-300"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar: Only minimal context and controls */}
      <header className="relative z-10 flex items-center justify-between w-full max-w-4xl mx-auto">
        {/* Course & Lecture Identity */}
        <div className="space-y-1 text-right">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs py-0.5">
              وضع التركيز العميق (Focus Mode)
            </Badge>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary shrink-0" />
            <span>{courseName || "مذاكرة عامة"}</span>
            {courseCode && (
              <span className="text-xs font-mono text-muted-foreground">({courseCode})</span>
            )}
          </h2>
          {lectureTitle && (
            <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-xs sm:max-w-md">
              {lectureTitle}
            </p>
          )}
        </div>

        {/* Minimal Action Controls (Sound, Fullscreen, Exit) */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled((prev) => !prev)}
            title={soundEnabled ? "كتم الصوت" : "تشغيل الصوت"}
            className="rounded-2xl h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            title={isFullscreen ? "إنهاء ملء الشاشة" : "وضع ملء الشاشة"}
            className="rounded-2xl h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-2xl gap-1.5 h-10 px-3.5 border-border/80 bg-secondary/50 hover:bg-secondary text-foreground text-xs font-semibold shadow-xs"
          >
            <X className="h-4 w-4" />
            <span>خروج من وضع التركيز</span>
          </Button>
        </div>
      </header>

      {/* Main Focus Area: Large Progress Timer */}
      <main className="relative z-10 flex flex-col items-center justify-center my-auto py-6">
        <div className="relative flex items-center justify-center">
          {/* Circular SVG */}
          <svg className="w-72 h-72 sm:w-88 sm:h-88 -rotate-90 transform" viewBox="0 0 300 300">
            {/* Background Track */}
            <circle
              cx="150"
              cy="150"
              r="130"
              className="stroke-muted/30"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Animated Progress Arc */}
            <circle
              cx="150"
              cy="150"
              r="130"
              className={`transition-all duration-700 ease-out ${
                isCompleted ? "stroke-emerald-500" : "stroke-primary"
              }`}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Digital Timer Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {isCompleted ? (
              <div className="space-y-2 animate-in zoom-in-95 duration-300">
                <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shadow-lg">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-foreground">
                  أحسنت العمل! 🎉
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  تم إكمال جلسة التركيز بنجاح
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="font-mono text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-foreground tabular-nums drop-shadow-xs">
                  {formatTimerDisplay(remainingSeconds)}
                </span>
                <div className="text-xs sm:text-sm font-semibold text-muted-foreground flex items-center justify-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isRunning ? "bg-emerald-500 animate-ping" : "bg-amber-500"
                    }`}
                  />
                  <span>{isRunning ? "جلسة قيد التقدم" : "مؤقت متوقف مؤقتاً"}</span>
                </div>
                <div className="text-[11px] text-muted-foreground/80 mt-1 font-mono">
                  {Math.round(progressRatio * 100)}% مكتمل
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Motivational Micro-Copy */}
        <p className="mt-8 text-xs sm:text-sm text-muted-foreground/80 max-w-sm text-center leading-relaxed">
          {isRunning
            ? "حافظ على تركيزك، عقلك قادر على استيعاب كل الأفكار خطوة بخطوة."
            : isCompleted
            ? "أخذ استراحة قصيرة بعد جلسة التركيز ينعش ذاكرتك ويعزز الفهم."
            : "اضغط استئناف للمتابعة عندما تكون مستعداً."}
        </p>
      </main>

      {/* Bottom Controls Bar: Pause/Resume, Reset, Finish Early */}
      <footer className="relative z-10 flex flex-wrap items-center justify-center gap-3 w-full max-w-lg mx-auto">
        {!isCompleted ? (
          <>
            <Button
              onClick={onTogglePlay}
              size="lg"
              className={`rounded-2xl px-8 h-13 text-sm font-black shadow-lg transition-all duration-200 active:scale-95 ${
                isRunning
                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="h-5 w-5 fill-current ml-2" />
                  <span>إيقاف مؤقت</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 fill-current ml-2" />
                  <span>{remainingSeconds < totalDurationSeconds ? "استئناف" : "بدء الجلسة"}</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onReset}
              className="rounded-2xl h-13 px-4 border-border/80 bg-secondary/40 hover:bg-secondary text-foreground text-xs font-semibold gap-1.5 shadow-xs"
              title="إعادة ضبط المؤقت"
            >
              <RotateCcw className="h-4 w-4" />
              <span>إعادة ضبط</span>
            </Button>

            {remainingSeconds < totalDurationSeconds && (
              <Button
                variant="outline"
                size="lg"
                onClick={onFinishEarly}
                className="rounded-2xl h-13 px-4 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold gap-1.5 shadow-xs"
                title="إنهاء الجلسة وحفظ الوقت المنجز"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>إنهاء وحفظ</span>
              </Button>
            )}
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              onClick={onReset}
              size="lg"
              className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>جلسة تركيز جديدة</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              className="rounded-2xl h-12 px-5 border-border bg-secondary/50 text-foreground font-semibold"
            >
              <span>العودة للمنصة</span>
            </Button>
          </div>
        )}
      </footer>
    </div>
  );
}
