import * as React from "react";
import Link from "next/link";
import { getStudentDashboardData } from "@/actions/student";
import { ContinueLearningWidget } from "@/components/student/continue-learning-widget";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { formatRelativeTime } from "@/lib/utils";
import {
  BookOpen,
  ArrowLeft,
  Bell,
  Video,
  FileText,
  Clock,
  Sparkles,
  Layers,
  ChevronLeft,
} from "lucide-react";

export default async function StudentDashboardPage() {
  const data = await getStudentDashboardData();
  const { profile, subjects, announcements, recentContents } = data;

  // Determine greeting based on local time
  const currentHour = new Date().getHours();
  const greeting =
    currentHour >= 5 && currentHour < 12
      ? "صباح الخير"
      : currentHour >= 12 && currentHour < 18
      ? "مساء الخير"
      : "أهلاً بك";

  return (
    <div className="space-y-8">
      {/* Top Greeting Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {greeting}، {profile.full_name.split(" ")[0]} 👋
          </h1>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          تابع محاضراتك واستكمل تقدمك الدراسي في المواد المخصصة لك
        </p>
      </div>

      {/* Announcements Banner (if any) */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          {announcements.slice(0, 2).map((a) => (
            <Card
              key={a.id}
              className="apple-card p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-200/60 dark:border-amber-900/40"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      {a.title}
                    </span>
                    {a.subject_name && (
                      <Badge variant="outline" className="text-[10px] border-amber-300 dark:border-amber-800">
                        {a.subject_name}
                      </Badge>
                    )}
                    <span className="text-[10px] text-zinc-400 mr-auto">
                      {formatRelativeTime(a.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2">
                    {a.content}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Continue Learning Widget */}
      <ContinueLearningWidget
        fallbackContent={
          recentContents.length > 0
            ? {
                contentId: recentContents[0].id,
                contentTitle: recentContents[0].title,
                contentType: recentContents[0].type,
                subjectId: recentContents[0].subjects.id,
                subjectName: recentContents[0].subjects.name,
                subjectCode: recentContents[0].subjects.code,
              }
            : null
        }
      />

      {/* Assigned Subjects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            المواد الدراسية المقررة
          </h2>
          <span className="text-xs text-zinc-400">
            {subjects.length} مواد مخصصة
          </span>
        </div>

        {subjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="لا توجد مواد مخصصة لحسابك حالياً"
            description="يرجى التواصل مع مسؤول المنصة لتعيين المواد الدراسية الخاصة بك"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => {
              const total = subject.total_contents || 0;
              const completed = subject.completed_contents || 0;
              const percentage = subject.progress_percentage || 0;

              return (
                <Link key={subject.id} href={`/subjects/${subject.id}`} className="group block">
                  <Card className="apple-card apple-card-hover p-5 h-full flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="font-mono text-xs uppercase">
                          {subject.code}
                        </Badge>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          {percentage}%
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {subject.name}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                          {subject.description || "استعرض محاضرات وسكاشن المادة"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span>التقدم الدراسي</span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {completed} / {total} مكتمل
                        </span>
                      </div>
                      <Progress value={percentage} className="h-1.5" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Recently Added Content in Assigned Subjects */}
      {recentContents.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-zinc-200/70 dark:border-zinc-800/70">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              أحدث المحتويات المضافة
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentContents.map((content) => {
              const hasVideo = content.resources?.some((r: any) => r.type === "video");
              const hasPdf = content.resources?.some((r: any) => r.type === "pdf");

              return (
                <Link
                  key={content.id}
                  href={`/content/${content.id}`}
                  className="group block p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant={content.type === "lecture" ? "default" : "purple"} className="text-[10px]">
                      {content.type === "lecture" ? "محاضرة" : "سكشن"}
                    </Badge>
                    <span className="text-[10px] text-zinc-400">
                      {formatRelativeTime(content.created_at)}
                    </span>
                  </div>

                  <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {content.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {content.subjects?.name}
                  </p>

                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400">
                    {hasVideo && (
                      <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                        <Video className="h-3 w-3" />
                        فيديو
                      </span>
                    )}
                    {hasPdf && (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <FileText className="h-3 w-3" />
                        PDF
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
