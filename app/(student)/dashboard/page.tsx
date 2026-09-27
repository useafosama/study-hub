import * as React from "react";
import Link from "next/link";
import { getStudentDashboardData } from "@/actions/student";
import { ContinueLearningWidget } from "@/components/student/continue-learning-widget";
import { StreakBadgeWidget } from "@/components/student/streak-badge-widget";
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
  Flame,
  Trophy,
  CheckCircle2,
  GraduationCap,
  PlayCircle
} from "lucide-react";

export default async function StudentDashboardPage() {
  const data = await getStudentDashboardData();
  const { profile, subjects, announcements, recentContents } = data;

  // Determine greeting based on local time
  const currentHour = new Date().getHours();
  const greeting =
    currentHour >= 5 && currentHour < 12
      ? "صباح الخير والنشاط"
      : currentHour >= 12 && currentHour < 18
      ? "مساء الخير والتفوق"
      : "أهلاً بك في منصتك";

  // Calculate overall progress across all subjects
  const totalContentsCount = subjects.reduce((acc, s) => acc + (s.total_contents || 0), 0);
  const totalCompletedCount = subjects.reduce((acc, s) => acc + (s.completed_contents || 0), 0);
  const overallPercentage = totalContentsCount > 0 
    ? Math.round((totalCompletedCount / totalContentsCount) * 100) 
    : 0;

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. Top Apple Frosted Welcome Hero Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-white p-7 sm:p-9 shadow-xl shadow-blue-500/20 border border-white/30">
        
        {/* Ambient Inner Highlights */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-xl px-3.5 py-1 text-xs font-bold text-white shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>منصة الچوو التعليمية — بإشراف يوسف أسامة</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
              {greeting}، {profile.full_name.split(" ")[0]} 👋
            </h1>

            <p className="text-xs sm:text-sm text-blue-50 leading-relaxed font-normal">
              أنت على بُعد خطوات من إتقان كل المواد. تابع محاضراتك المسجلة وحمّل مذكراتك للمراجعة.
            </p>
          </div>

          {/* Quick Progress Box */}
          <div className="flex items-center gap-4 bg-white/15 backdrop-blur-2xl border border-white/30 rounded-3xl p-4.5 self-start md:self-auto shrink-0 shadow-lg hover:scale-105 transition-transform duration-300">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-amber-400 text-amber-950 font-black text-xl shadow-md">
              <Trophy className="h-6 w-6" />
            </div>
            <div className="text-right">
              <div className="text-xs text-blue-100 font-bold">معدل الإنجاز العام</div>
              <div className="text-2xl font-black">{overallPercentage}%</div>
              <div className="text-[11px] text-blue-200">{totalCompletedCount} من {totalContentsCount} درس مكتمل</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Bar (Apple Frosted Glass) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card-interactive p-4.5 rounded-3xl flex items-center gap-3.5 group cursor-default">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-primary font-bold border border-primary/20 shadow-xs group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground">المواد المخصصة</div>
            <div className="text-lg font-black text-foreground">{subjects.length} مواد</div>
          </div>
        </div>

        <div className="glass-card-interactive p-4.5 rounded-3xl flex items-center gap-3.5 group cursor-default">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 shadow-xs group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground">الدروس المكتملة</div>
            <div className="text-lg font-black text-foreground">{totalCompletedCount} محاضرة</div>
          </div>
        </div>

        <div className="glass-card-interactive p-4.5 rounded-3xl flex items-center gap-3.5 group cursor-default">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20 shadow-xs group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground">إجمالي المحتوى</div>
            <div className="text-lg font-black text-foreground">{totalContentsCount} درس</div>
          </div>
        </div>

        <div className="glass-card-interactive p-4.5 rounded-3xl flex items-center gap-3.5 group cursor-default">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20 shadow-xs group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground">التنبيهات</div>
            <div className="text-lg font-black text-foreground">{announcements.length} إعلان</div>
          </div>
        </div>
      </div>

      {/* 3. Continue Learning Banner */}
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

      {/* 4. Badges & Daily Streak System */}
      <StreakBadgeWidget
        totalContents={totalContentsCount}
        completedContents={totalCompletedCount}
        subjectsCount={subjects.length}
        completedSubjectsCount={subjects.filter((s) => s.progress_percentage === 100).length}
      />

      {/* 5. Announcements Section (if any) */}
      {announcements.length > 0 && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-500" />
              <span>تنبيهات وملاحظات الأستاذ يوسف أسامة</span>
            </h2>
            <Link href="/announcements" className="text-xs font-bold text-primary hover:underline">
              عرض الكل
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {announcements.slice(0, 2).map((a) => (
              <div
                key={a.id}
                className="glass-card-interactive p-4.5 rounded-3xl border-amber-500/30 bg-amber-500/5 flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-foreground truncate">
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Assigned Subjects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <BookOpen className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              المواد والمقررات الدراسية
            </h2>
          </div>
          <span className="text-xs text-muted-foreground font-semibold">
            {subjects.length} مقررات متاحة
          </span>
        </div>

        {subjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="لا توجد مواد مخصصة لحسابك حالياً"
            description="يرجى التواصل مع مسؤول المنصة لتعيين المواد الدراسية الخاصة بك"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((subject, index) => {
              const total = subject.total_contents || 0;
              const completed = subject.completed_contents || 0;
              const percentage = subject.progress_percentage || 0;

              return (
                <Link key={subject.id} href={`/subjects/${subject.id}`} className="group block">
                  <div className="glass-card-interactive p-6 h-full flex flex-col justify-between">
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold uppercase px-3 py-1 rounded-xl bg-muted text-muted-foreground border border-border/60">
                          {subject.code}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                          <span>{percentage}%</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                          {subject.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                          {subject.description || "استعرض محاضرات وسكاشن المادة وتدريباتها"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-4 mt-5 border-t border-border/60">
                      <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                        <span>نسبة الإنجاز</span>
                        <span className="font-bold text-foreground">
                          {completed} من {total} مكتمل
                        </span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. Recently Added Lectures & Resources */}
      {recentContents.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>أحدث المحتويات المضافة للمقررات</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentContents.map((content) => {
              const hasVideo = content.resources?.some((r: any) => r.type === "video");
              const hasPdf = content.resources?.some((r: any) => r.type === "pdf");

              return (
                <Link
                  key={content.id}
                  href={`/content/${content.id}`}
                  className="group block p-4.5 rounded-3xl glass-card-interactive"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                      {content.type === "lecture" ? "محاضرة مسجلة" : "سكشن تطبيقي"}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {formatRelativeTime(content.created_at)}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {content.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {content.subjects?.name}
                  </p>

                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/60 text-[11px]">
                    {hasVideo && (
                      <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
                        <Video className="h-3.5 w-3.5" />
                        فيديو
                      </span>
                    )}
                    {hasPdf && (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
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

    </div>
  );
}

