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
      
      {/* 1. Top Motivational Welcome Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-6 sm:p-8 shadow-xl shadow-blue-600/15">
        
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold text-blue-100">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>منصة الچوو التعليمية — بإشراف يوسف أسامة</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              {greeting}، {profile.full_name.split(" ")[0]} 👋
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-normal">
              أنت على بُعد خطوات من إتقان كل المواد. تابع محاضراتك المسجلة وحمّل مذكراتك للمراجعة.
            </p>
          </div>

          {/* Quick Progress Ring / Stat Box */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 self-start md:self-auto shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-amber-950 font-black text-lg shadow-md">
              <Trophy className="h-6 w-6" />
            </div>
            <div className="text-right">
              <div className="text-xs text-blue-100 font-medium">معدل الإنجاز العام</div>
              <div className="text-xl font-black">{overallPercentage}%</div>
              <div className="text-[10px] text-blue-200">{totalCompletedCount} من {totalContentsCount} درس مكتمل</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-zinc-500">المواد المخصصة</div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{subjects.length} مواد</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-zinc-500">الدروس المكتملة</div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{totalCompletedCount} محاضرة</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-zinc-500">إجمالي الدروس</div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{totalContentsCount} درس</div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-zinc-500">التنبيهات</div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{announcements.length} إعلان</div>
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-500" />
              <span>تنبيهات وملاحظات الأستاذ يوسف أسامة</span>
            </h2>
            <Link href="/announcements" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              عرض الكل
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {announcements.slice(0, 2).map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 backdrop-blur-xs flex items-start gap-3.5 shadow-xs"
              >
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {a.title}
                    </span>
                    <span className="text-[10px] text-zinc-400 shrink-0">
                      {formatRelativeTime(a.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                    {a.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Assigned Subjects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              المواد والمقررات الدراسية
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-medium">
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

              // Color accents
              const gradients = [
                "from-blue-600/10 to-indigo-600/10 border-blue-500/30 text-blue-600",
                "from-purple-600/10 to-pink-600/10 border-purple-500/30 text-purple-600",
                "from-emerald-600/10 to-teal-600/10 border-emerald-500/30 text-emerald-600",
                "from-amber-600/10 to-orange-600/10 border-amber-500/30 text-amber-600",
              ];
              const accentStyle = gradients[index % gradients.length];

              return (
                <Link key={subject.id} href={`/subjects/${subject.id}`} className="group block">
                  <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 h-full flex flex-col justify-between shadow-xs hover:shadow-xl hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-200">
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold uppercase px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {subject.code}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                          <span>{percentage}%</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {subject.name}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                          {subject.description || "استعرض محاضرات وسكاشن المادة وتدريباتها"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span>نسبة الإنجاز</span>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {completed} من {total} مكتمل
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
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

      {/* 6. Recently Added Lectures & Resources */}
      {recentContents.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>أحدث المحتويات المضافة للمقررات</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {recentContents.map((content) => {
              const hasVideo = content.resources?.some((r: any) => r.type === "video");
              const hasPdf = content.resources?.some((r: any) => r.type === "pdf");

              return (
                <Link
                  key={content.id}
                  href={`/content/${content.id}`}
                  className="group block p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-500/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                      {content.type === "lecture" ? "محاضرة مسجلة" : "سكشن تطبيقي"}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {formatRelativeTime(content.created_at)}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {content.title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    {content.subjects?.name}
                  </p>

                  <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px]">
                    {hasVideo && (
                      <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                        <Video className="h-3.5 w-3.5" />
                        فيديو
                      </span>
                    )}
                    {hasPdf && (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
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
