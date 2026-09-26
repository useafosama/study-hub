"use client";

import * as React from "react";
import { Flame, Trophy, Award, Sparkles, CheckCircle, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getGamificationState, BadgeItem } from "@/lib/gamification/badges";
import { getStoredNotes } from "@/lib/storage/notes";

interface StreakBadgeWidgetProps {
  totalContents: number;
  completedContents: number;
  subjectsCount: number;
  completedSubjectsCount: number;
}

export function StreakBadgeWidget({
  totalContents,
  completedContents,
  subjectsCount,
  completedSubjectsCount,
}: StreakBadgeWidgetProps) {
  const [mounted, setMounted] = React.useState(false);
  const [gamification, setGamification] = React.useState<{
    streakDays: number;
    badges: BadgeItem[];
  }>({
    streakDays: 1,
    badges: [],
  });

  React.useEffect(() => {
    setMounted(true);
    const notes = getStoredNotes();
    const state = getGamificationState({
      totalContents,
      completedContents,
      notesCount: notes.length,
      subjectsCount,
      completedSubjectsCount,
    });
    setGamification(state);
  }, [totalContents, completedContents, subjectsCount, completedSubjectsCount]);

  if (!mounted) return null;

  const unlockedCount = gamification.badges.filter((b) => b.isUnlocked).length;

  return (
    <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 space-y-5 shadow-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                أوسمة وإنجازات التعلم
              </h3>
              <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600 dark:text-amber-400">
                {unlockedCount} من {gamification.badges.length} مكتمل
              </Badge>
            </div>
            <p className="text-xs text-zinc-500">
              واصل دراستك لفتح أوسمة التفوق وشارات الالتزام
            </p>
          </div>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 self-start sm:self-auto">
          <Flame className="h-4 w-4 fill-orange-500 text-orange-500 animate-bounce" />
          <span className="text-xs font-bold font-mono">
            {gamification.streakDays} {gamification.streakDays === 1 ? "يوم التزام" : "أيام التزام متتالية"} 🔥
          </span>
        </div>
      </div>

      {/* Badges Carousel / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {gamification.badges.map((badge) => {
          return (
            <div
              key={badge.id}
              className={`relative rounded-2xl p-3 text-center flex flex-col items-center justify-between border transition-all ${
                badge.isUnlocked
                  ? "bg-gradient-to-b from-amber-50/60 to-white dark:from-amber-950/20 dark:to-zinc-900 border-amber-300 dark:border-amber-700/60 shadow-xs scale-100 hover:scale-105"
                  : "bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200/60 dark:border-zinc-800/60 opacity-60 grayscale"
              }`}
            >
              <div className="space-y-1 my-auto">
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 line-clamp-1">
                  {badge.title}
                </div>
                <div className="text-[10px] text-zinc-500 line-clamp-2 leading-tight">
                  {badge.description}
                </div>
              </div>

              <div className="mt-2 w-full pt-1.5 border-t border-zinc-100 dark:border-zinc-800 text-[10px]">
                {badge.isUnlocked ? (
                  <span className="font-bold text-amber-600 dark:text-amber-400">مكتسب ✓</span>
                ) : (
                  <div className="space-y-1">
                    <span className="text-zinc-400 font-mono">{badge.progress}%</span>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${badge.progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
