"use client";

import * as React from "react";
import Link from "next/link";
import { Play, ArrowLeft, BookOpen } from "lucide-react";
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
    <Card className="apple-card p-5 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent border-blue-200/60 dark:border-blue-900/40 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Play className="h-5 w-5 fill-current ml-0.5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                متابعة التعلم
              </span>
              <Badge variant="outline" className="text-[10px] uppercase font-mono">
                {activeItem.subjectCode || activeItem.subjects?.code}
              </Badge>
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {activeItem.subjectName || activeItem.subjects?.name}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {activeItem.contentTitle || activeItem.title}
            </p>
          </div>
        </div>

        <Button asChild className="rounded-xl shadow-sm gap-2 shrink-0 self-end sm:self-center">
          <Link href={`/content/${activeItem.contentId || activeItem.id}`}>
            <span>متابعة المحاضرة</span>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
