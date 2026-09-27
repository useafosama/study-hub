"use client";

import * as React from "react";
import Link from "next/link";
import { Play, ArrowLeft, Sparkles, BookOpen, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface RecentViewedItem {
  contentId: string;
  contentTitle: string;
  contentType: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  timestamp: number;
}

export function saveRecentViewed(item: Omit<RecentViewedItem, "timestamp">) {
  if (typeof window === "undefined") return;
  try {
    const data: RecentViewedItem = {
      ...item,
      timestamp: Date.now(),
    };
    localStorage.setItem("studyhub_recent_viewed", JSON.stringify(data));
  } catch {}
}

export function ContinueLearningWidget({ fallbackContent }: { fallbackContent?: any }) {
  const [recent, setRecent] = React.useState<RecentViewedItem | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("studyhub_recent_viewed");
      if (stored) {
        setRecent(JSON.parse(stored));
      }
    } catch {}
  }, []);

  if (!mounted) {
    return null;
  }

  const activeItem = recent || fallbackContent;
  if (!activeItem) return null;

  return (
    <div className="relative rounded-3xl overflow-hidden border border-primary/30 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/5 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-card p-6 backdrop-blur-xl shadow-lg shadow-blue-500/5">
      
      {/* Background soft ambient highlight */}
      <div className="pointer-events-none absolute -top-12 -left-12 w-48 h-48 bg-primary/15 rounded-full blur-2xl" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30">
            <Play className="h-6 w-6 fill-current ml-0.5" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20">
                <Sparkles className="h-3 w-3" />
                استئناف المحاضرة الأخيرة
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                {activeItem.subjectCode || activeItem.subjects?.code}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-foreground">
              {activeItem.contentTitle || activeItem.title}
            </h3>

            <p className="text-xs text-muted-foreground">
              المقرر: {activeItem.subjectName || activeItem.subjects?.name}
            </p>
          </div>
        </div>

        <Button
          asChild
          size="lg"
          className="rounded-2xl h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 shrink-0 self-end md:self-center gap-2 transition-transform hover:scale-105"
        >
          <Link href={`/content/${activeItem.contentId || activeItem.id}`}>
            <span>متابعة الدرس الآن</span>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

