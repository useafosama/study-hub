import * as React from "react";
import Link from "next/link";
import { getStudentDashboardData } from "@/actions/student";
import { ContinueLearningWidget } from "@/components/student/continue-learning-widget";
import { FocusTimerWidget } from "@/components/student/focus-timer-widget";
import { StreakBadgeWidget } from "@/components/student/streak-badge-widget";
import { Card } from "@/components/ui/card";
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
  Trophy,
  CheckCircle2,
  PlayCircle,
  GraduationCap,
  Layers,
} from "lucide-react";

export const metadata = {
  title: "لوحة التعلم | Study Hub",
  description: "متابعة تقدمك الدراسي والمحاضرات المسجلة والسكاشن",
};

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

  // Calculate overall progress across all subjects
  const totalContentsCount = subjects.reduce((acc, s) => acc + (s.total_contents || 0), 0);
  const totalCompletedCount = subjects.reduce((acc, s) => acc + (s.completed_contents || 0), 0);
  const overallPercentage = totalContentsCount > 0
    ? Math.round((totalCompletedCount / totalContentsCount) * 100)
    : 0;

  const firstName = profile.full_name?.split(" ")[0] || "طالب العلم";

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Top Calm Greeting & Profile Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans">
              {greeting}، {firstName} 👋
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
              <Sparkles className="h-3 w-3" />
              جاهز للمذاكرة
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            تابع تقدمك الدراسي وأكمل خطتك التعليمية لليوم
          </p>
        </div>

        {/* Compact Overall Progress Pill */}
        <div className="flex items-center gap-3 bg-card border border-border/80 px-4 py-2 rounded-2xl shadow-xs self-start sm:self-auto">
          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Trophy className="h-4.5 w-4.5" />
          </div>
          <div className="text-right">
            <div className="text-[11px] text-muted-foreground font-medium">الإنجاز العام</div>
            <div className="text-sm font-bold text-foreground">
              {overallPercentage}% <span className="text-[10px] text-muted-foreground font-normal">({totalCompletedCount}/{totalContentsCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. FIRST THING: CONTINUE LEARNING (ACTION) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
              استئناف المذاكرة
            </h2>
          </div>
        </div>

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
      </section>

      {/* 2. SECOND THING: TODAY'S PROGRESS & STUDY SESSION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
              جلسة ومؤقت التركيز لليوم
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            جلسات تركيز عميقة خالية من التشتيت
          </span>
        </div>

        {/* Study Timer Widget */}
        <FocusTimerWidget
          userId={profile.id}
          subjects={subjects.map((s) => ({
            id: s.id,
            name: s.name,
            code: s.code,
          }))}
        />

        {/* Streak & Milestone Badge */}
        <StreakBadgeWidget
          totalContents={totalContentsCount}
          completedContents={totalCompletedCount}
          subjectsCount={subjects.length}
          completedSubjectsCount={subjects.filter((s) => s.progress_percentage === 100).length}
        />
      </section>

      {/* 3. THIRD THING: MY COURSES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
              موادي ومقرراتي الدراسية
            </h2>
          </div>
          <Link
            href="/subjects"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>عرض كل المواد ({subjects.length})</span>
            <ArrowLeft className="h-3 w-3" />
          </Link>
        </div>

        {subjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="لا توجد مواد مخصصة لحسابك حالياً"
            description="يرجى التواصل مع مسؤول المنصة لتعيين المواد الدراسية المقررة لك"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => {
              const total = subject.total_contents || 0;
              const completed = subject.completed_contents || 0;
              const percentage = subject.progress_percentage || 0;

              return (
                <Link
                  key={subject.id}
                  href={`/subjects/${subject.id}`}
                  className="apple-card apple-card-hover p-5 flex flex-col justify-between group block cursor-pointer transition-all duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold uppercase px-2.5 py-0.5 rounded-lg bg-secondary text-secondary-foreground border border-border/60">
                        {subject.code}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                        <span>{percentage}%</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {subject.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        {subject.description || "استعرض محاضرات وسكاشن المادة وتدريباتها"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 mt-4 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>نسبة الإنجاز</span>
                      <span className="font-semibold text-foreground">
                        {completed} من {total} مكتمل
                      </span>
                    </div>
                    <div className="w-full bg-secondary/80 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. FOURTH THING: UPCOMING / RECOMMENDED & RECENT ANNOUNCEMENTS */}
      <section className="space-y-6 pt-2">
        {/* Recommended Recent Lectures */}
        {recentContents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  أحدث المحتويات المقترحة للمذاكرة
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {recentContents.slice(0, 3).map((content) => {
                const hasVideo = content.resources?.some((r: any) => r.type === "video");
                const hasPdf = content.resources?.some((r: any) => r.type === "pdf");

                return (
                  <Link
                    key={content.id}
                    href={`/content/${content.id}`}
                    className="apple-card apple-card-hover p-4 group block transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                        {content.type === "lecture" ? "محاضرة" : "سكشن"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {formatRelativeTime(content.created_at)}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {content.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {content.subjects?.name}
                    </p>

                    <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-border/40 text-[11px]">
                      {hasVideo && (
                        <span className="flex items-center gap-1 text-red-500 font-medium">
                          <Video className="h-3.5 w-3.5" />
                          فيديو
                        </span>
                      )}
                      {hasPdf && (
                        <span className="flex items-center gap-1 text-amber-500 font-medium">
                          <FileText className="h-3.5 w-3.5" />
                          مذكرة PDF
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Latest Announcements Banner (if any) */}
        {announcements.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold text-foreground">
                  آخر التنبيهات والإعلانات
                </h3>
              </div>
              <Link href="/announcements" className="text-xs font-semibold text-primary hover:underline">
                مركز الإعلانات
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {announcements.slice(0, 2).map((a) => (
                <Link
                  key={a.id}
                  href={`/announcements?id=${a.id}`}
                  className="apple-card p-4 hover:border-amber-500/40 flex items-start gap-3 transition-all block group"
                >
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500 shrink-0 mt-0.5">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {a.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                        {formatRelativeTime(a.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {a.content}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
