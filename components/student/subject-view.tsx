"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import {
  BookOpen,
  Video,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  Circle,
  ChevronRight,
  Layers,
  ArrowLeft,
  Bookmark,
} from "lucide-react";
import { Subject, Content } from "@/types/database";

interface SubjectViewProps {
  subject: Subject;
  lectures: Content[];
  sections: Content[];
  totalCount: number;
  completedCount: number;
  progressPercentage: number;
}

export function SubjectView({
  subject,
  lectures,
  sections,
  totalCount,
  completedCount,
  progressPercentage,
}: SubjectViewProps) {
  const [activeTab, setActiveTab] = React.useState<"all" | "lectures" | "sections">("all");

  const displayedContents =
    activeTab === "lectures"
      ? lectures
      : activeTab === "sections"
      ? sections
      : [...lectures, ...sections];

  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <Link href="/subjects" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          المواد الدراسية
        </Link>
        <ChevronRight className="h-3.5 w-3.5 rotate-180" />
        <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
          {subject.name}
        </span>
      </div>

      {/* Subject Header Card */}
      <Card className="apple-card p-6 bg-gradient-to-l from-blue-500/10 via-indigo-500/5 to-transparent border-blue-200/60 dark:border-blue-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs uppercase">
                {subject.code}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {lectures.length} محاضرات • {sections.length} أقسام
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {subject.name}
            </h1>
            {subject.description && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                {subject.description}
              </p>
            )}
          </div>

          {/* Progress Indicator Card */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 min-w-[200px] space-y-2 shrink-0 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-600 dark:text-zinc-400">نسبة الإنجاز</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                {progressPercentage}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-[11px] text-zinc-400 text-center">
              {completedCount} من {totalCount} محتوى مكتمل
            </p>
          </div>
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <Button
          variant={activeTab === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("all")}
          className="rounded-xl text-xs"
        >
          كل المحتوى ({totalCount})
        </Button>
        <Button
          variant={activeTab === "lectures" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("lectures")}
          className="rounded-xl text-xs gap-1.5"
        >
          <Video className="h-3.5 w-3.5" />
          <span>المحاضرات ({lectures.length})</span>
        </Button>
        <Button
          variant={activeTab === "sections" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("sections")}
          className="rounded-xl text-xs gap-1.5"
        >
          <Layers className="h-3.5 w-3.5" />
          <span>السكاشن والأقسام ({sections.length})</span>
        </Button>
      </div>

      {/* Content List */}
      {displayedContents.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="لا يوجد محتوى منشور في هذا القسم بعد"
          description="سيتم إشعارك عند رفع محاضرات وسكاشن جديدة"
        />
      ) : (
        <div className="space-y-3">
          {displayedContents.map((item, idx) => {
            const hasVideo = item.resources?.some((r) => r.type === "video");
            const hasPdf = item.resources?.some((r) => r.type === "pdf");
            const hasLink = item.resources?.some((r) => r.type === "link");

            return (
              <Link key={item.id} href={`/content/${item.id}`} className="group block">
                <Card className="apple-card p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Completion status icon */}
                    <div className="shrink-0">
                      {item.is_completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950/40" />
                      ) : (
                        <Circle className="h-5 w-5 text-zinc-300 dark:text-zinc-700" />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={item.type === "lecture" ? "default" : "purple"}
                          className="text-[10px]"
                        >
                          {item.type === "lecture" ? "محاضرة" : "سكشن"}
                        </Badge>
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {item.title}
                        </h3>
                        {item.is_bookmarked && (
                          <Bookmark className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        )}
                      </div>

                      {item.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                          {item.description}
                        </p>
                      )}

                      {/* Resource Indicators */}
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        {hasVideo && (
                          <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                            <Video className="h-3 w-3" />
                            فيديو
                          </span>
                        )}
                        {hasPdf && (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                            <FileText className="h-3 w-3" />
                            PDF
                          </span>
                        )}
                        {hasLink && (
                          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                            <LinkIcon className="h-3 w-3" />
                            مراجع
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl gap-1 text-xs text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0"
                  >
                    <span>فتح</span>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
