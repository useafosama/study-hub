"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Video,
  FileText,
  Activity,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Search,
  Flame,
  Trophy,
  GraduationCap,
  TrendingUp,
  BarChart3,
  Send,
  HelpCircle,
  ChevronLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";
import { formatDurationArabic } from "@/lib/storage/timer";
import { AdminOverviewData } from "@/actions/admin";
import { StudentDetailsDrawer } from "./student-details-drawer";

interface AdminControlCenterProps {
  data: AdminOverviewData;
}

export function AdminControlCenter({ data }: AdminControlCenterProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  // Filter courses based on search
  const filteredCourses = React.useMemo(() => {
    if (!searchQuery.trim()) return data.courseStats;
    const q = searchQuery.toLowerCase();
    return data.courseStats.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.code && c.code.toLowerCase().includes(q))
    );
  }, [data.courseStats, searchQuery]);

  // Filter active students based on search
  const filteredStudents = React.useMemo(() => {
    if (!searchQuery.trim()) return data.mostActiveStudents;
    const q = searchQuery.toLowerCase();
    return data.mostActiveStudents.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q)
    );
  }, [data.mostActiveStudents, searchQuery]);

  const handleOpenStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* 1. Hero Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-600 dark:text-purple-400 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>مركز القيادة والإدارة التعليمية LMS Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            لوحة الإشراف والمتابعة الشاملة ⚡
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            إدارة كاملة للمواد، الطلاب، إحصائيات المذاكرة، وتدقيق النشاطات الأكاديمية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Button asChild size="sm" className="rounded-2xl text-xs font-bold gap-1.5 h-10 shadow-xs">
            <Link href="/admin/users">
              <Plus className="h-4 w-4" />
              <span>إضافة طالب</span>
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm" className="rounded-2xl text-xs font-bold gap-1.5 h-10 shadow-xs">
            <Link href="/admin/subjects">
              <BookOpen className="h-4 w-4 text-emerald-600" />
              <span>إضافة مادة</span>
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm" className="rounded-2xl text-xs font-bold gap-1.5 h-10 shadow-xs">
            <Link href="/admin/announcements">
              <Send className="h-4 w-4 text-primary" />
              <span>إرسال إشعار</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Global Quick Search Bar */}
      <div className="relative">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث سريع في أسماء الطلاب، المواد الدراسية، أو الأكواد..."
          className="pr-10 rounded-2xl h-12 text-xs bg-card/60 backdrop-blur-md border-border/80"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-bold"
          >
            مسح
          </button>
        )}
      </div>

      {/* 3. High-Level 8 Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Students */}
        <Link href="/admin/users" className="group">
          <Card className="apple-card apple-card-hover p-4 sm:p-5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 text-primary border border-primary/20">
                <Users className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">
                {data.studentsCount}
              </div>
              <div className="text-xs font-bold text-muted-foreground mt-0.5">
                إجمالي الطلاب المسجلين
              </div>
            </div>
          </Card>
        </Link>

        {/* Active Students Today */}
        <Link href="/admin/users" className="group">
          <Card className="apple-card apple-card-hover p-4 sm:p-5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Flame className="h-5 w-5" />
              </div>
              <Badge variant="warning" className="text-[10px]">
                اليوم
              </Badge>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-foreground font-mono flex items-center gap-1.5">
                <span>{data.activeStudentsTodayCount}</span>
                <span className="text-xs font-normal text-muted-foreground">نشط</span>
              </div>
              <div className="text-xs font-bold text-muted-foreground mt-0.5">
                تفاعلوا أو درسوا اليوم
              </div>
            </div>
          </Card>
        </Link>

        {/* Total Courses */}
        <Link href="/admin/subjects" className="group">
          <Card className="apple-card apple-card-hover p-4 sm:p-5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <BookOpen className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">
                {data.totalCoursesCount}
              </div>
              <div className="text-xs font-bold text-muted-foreground mt-0.5">
                المواد والمقررات الدراسية
              </div>
            </div>
          </Card>
        </Link>

        {/* Total Lectures & Sections */}
        <Link href="/admin/subjects" className="group">
          <Card className="apple-card apple-card-hover p-4 sm:p-5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <Video className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                {data.totalSectionsCount} سكشن
              </span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">
                {data.totalLecturesCount}
              </div>
              <div className="text-xs font-bold text-muted-foreground mt-0.5">
                محاضرة مسجلة بالمنصة
              </div>
            </div>
          </Card>
        </Link>

        {/* Total Resources */}
        <div className="p-4 sm:p-5 rounded-3xl bg-card/70 border border-border/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-[11px] text-muted-foreground">PDF / فيديو / روابط</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              {data.totalResourcesCount}
            </div>
            <div className="text-xs font-bold text-muted-foreground mt-0.5">
              مرفقات وملخصات معتمدة
            </div>
          </div>
        </div>

        {/* Total Study Hours */}
        <div className="p-4 sm:p-5 rounded-3xl bg-card/70 border border-border/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <Clock className="h-5 w-5" />
            </div>
            <Badge variant="secondary" className="text-[10px]">
              مؤقت التركيز
            </Badge>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              {data.totalStudyHours}{" "}
              <span className="text-xs font-normal text-muted-foreground">ساعة</span>
            </div>
            <div className="text-xs font-bold text-muted-foreground mt-0.5">
              إجمالي وقت المذاكرة الموثق
            </div>
          </div>
        </div>

        {/* Quizzes Activity */}
        <div className="p-4 sm:p-5 rounded-3xl bg-card/70 border border-border/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-[11px] text-muted-foreground">
              {data.totalExamsCount} بنك أسئلة
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              {data.totalExamsCount > 0 ? "نشط" : "قيد الإعداد"}
            </div>
            <div className="text-xs font-bold text-muted-foreground mt-0.5">
              نشاط الامتحانات والتقييمات
            </div>
          </div>
        </div>

        {/* Platform Completion Rate */}
        <div className="p-4 sm:p-5 rounded-3xl bg-card/70 border border-border/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">
              {data.totalCompletionsCount} إكمال
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-primary font-mono">
              {data.overallPlatformProgress}%
            </div>
            <div className="text-xs font-bold text-muted-foreground mt-0.5">
              معدل استيعاب المحتوى العام
            </div>
          </div>
        </div>
      </div>

      {/* 4. Deep Analytics: Most Active Students & Course Breakdown Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Most Active Students Leaderboard (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span>الطلاب الأكثر نشاطاً وإنجازاً</span>
            </h3>
            <Link
              href="/admin/users"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>إدارة الطلاب</span>
              <ChevronLeft className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card/70 backdrop-blur-xl overflow-hidden divide-y divide-border/60 shadow-xs">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                لا يوجد طلاب مسجلون حالياً
              </div>
            ) : (
              filteredStudents.map((st, idx) => (
                <div
                  key={st.id}
                  onClick={() => handleOpenStudent(st.id)}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-secondary/40 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[11px] font-black text-muted-foreground">
                      {idx + 1}
                    </span>
                    <Avatar className="h-9 w-9 ring-1 ring-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {st.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
                        <span>{st.fullName}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate font-mono dir-ltr text-right">
                        @{st.username}
                      </div>
                    </div>
                  </div>

                  <div className="text-left shrink-0 space-y-0.5">
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {st.completedLecturesCount} محاضرة مكتملة
                    </Badge>
                    {st.studyTimeSeconds > 0 && (
                      <span className="block text-[10px] text-primary font-bold">
                        {formatDurationArabic(st.studyTimeSeconds)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Most Watched Courses & Completion Rates (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <span>معدلات إنجاز المواد الدراسية</span>
            </h3>
            <Link
              href="/admin/subjects"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>تعديل المواد</span>
              <ChevronLeft className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card/70 backdrop-blur-xl p-5 space-y-4 shadow-xs">
            {filteredCourses.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                لا توجد مواد دراسية مضافة
              </div>
            ) : (
              filteredCourses.slice(0, 5).map((course) => (
                <div key={course.subjectId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{course.name}</span>
                      {course.code && (
                        <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.2 rounded">
                          {course.code}
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-primary">
                      {course.averageProgress}% (إجمالي {course.completedContentsTotal} إكمال)
                    </span>
                  </div>
                  <Progress value={course.averageProgress} className="h-2 bg-secondary" />
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{course.enrolledStudentsCount} طلاب مسندين</span>
                    <span>{course.totalContents} دروس منشورة</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. Main Feed: Recent Content & Live Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Contents (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>أحدث المحتويات والدروس المضافة</span>
            </h3>
            <Link
              href="/admin/subjects"
              className="text-xs font-bold text-primary hover:underline"
            >
              عرض الكل
            </Link>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card/70 backdrop-blur-xl overflow-hidden divide-y divide-border/60 shadow-xs">
            {data.recentContents.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                لا يوجد محتوى مضاف حتى الآن
              </div>
            ) : (
              data.recentContents.map((content: any) => (
                <div
                  key={content.id}
                  className="flex items-center justify-between p-4 hover:bg-secondary/40 transition-colors"
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {content.title}
                      </span>
                      <Badge variant={content.is_published ? "success" : "secondary"} className="text-[10px]">
                        {content.is_published ? "منشور" : "مسودة"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {(content.subjects as any)?.name} •{" "}
                      {content.type === "lecture"
                        ? "محاضرة"
                        : content.type === "section"
                        ? "سكشن"
                        : content.type === "exam"
                        ? "امتحان"
                        : "ملخص"}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0 font-medium">
                    {formatRelativeTime(content.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Activity Feed (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-500" />
              <span>سجل النشاطات الإدارية المباشر</span>
            </h3>
            <Link
              href="/admin/activity"
              className="text-xs font-bold text-primary hover:underline"
            >
              عرض السجل الكامل
            </Link>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card/70 backdrop-blur-xl overflow-hidden divide-y divide-border/60 shadow-xs">
            {data.recentActivityLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                لا توجد نشاطات مسجلة بعد
              </div>
            ) : (
              data.recentActivityLogs.map((log: any) => (
                <div key={log.id} className="p-3.5 space-y-1 text-xs hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      {log.user_full_name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatRelativeTime(log.created_at)}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    {log.action === "create_user" && "قام بإنشاء مستخدم جديد"}
                    {log.action === "update_user" && "قام بتعديل بيانات مستخدم"}
                    {log.action === "delete_user" && "قام بحذف حساب مستخدم"}
                    {log.action === "create_subject" && "قام بإنشاء مادة جديدة"}
                    {log.action === "update_subject" && "قام بتحديث مادة"}
                    {log.action === "create_content" && "أضاف محتوى دراسي جديد"}
                    {log.action === "update_content" && "حدّث محتوى دراسي"}
                    {log.action === "create_announcement" && "نشر إعلاناً جديداً"}
                    {log.action === "create_notification" && "أرسل إشعاراً مباشراً للطلاب"}
                    {log.action === "study_session" && `أتم جلسة مذاكرة (${log.metadata?.courseName || "مادة"})`}
                    {log.action === "login" && "سجل دخوله إلى المنصة"}
                    {![
                      "create_user",
                      "update_user",
                      "delete_user",
                      "create_subject",
                      "update_subject",
                      "create_content",
                      "update_content",
                      "create_announcement",
                      "create_notification",
                      "study_session",
                      "login",
                    ].includes(log.action) && log.action}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 6. Embedded Student Inspection Drawer */}
      <StudentDetailsDrawer
        studentId={selectedStudentId}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedStudentId(null);
        }}
      />
    </div>
  );
}
