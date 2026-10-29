"use client";

import * as React from "react";
import {
  X,
  User,
  Clock,
  BookOpen,
  CheckCircle2,
  Trophy,
  Flame,
  Activity,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Shield,
  GraduationCap,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";
import { formatDurationArabic } from "@/lib/storage/timer";
import { StudentFullDetails, getStudentFullDetailsAction } from "@/actions/admin";

interface StudentDetailsDrawerProps {
  studentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus?: (studentId: string, currentStatus: boolean) => void;
}

export function StudentDetailsDrawer({
  studentId,
  isOpen,
  onClose,
  onToggleStatus,
}: StudentDetailsDrawerProps) {
  const [loading, setLoading] = React.useState(false);
  const [details, setDetails] = React.useState<StudentFullDetails | null>(null);

  React.useEffect(() => {
    if (!studentId || !isOpen) {
      setDetails(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    getStudentFullDetailsAction(studentId)
      .then((data) => {
        if (isMounted) {
          setDetails(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error loading student details:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [studentId, isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 space-y-6">
        <DialogHeader className="border-b border-border/60 pb-4">
          <DialogTitle className="text-lg sm:text-xl font-black text-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span>ملف الطالب والمسار الأكاديمي الشامل</span>
            </div>
            {details && (
              <Badge variant={details.student.is_active ? "success" : "destructive"} className="text-xs">
                {details.student.is_active ? "حساب نشط" : "حساب معطل"}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground font-semibold">
              جاري تجميع إحصائيات ونشاطات الطالب...
            </p>
          </div>
        ) : !details ? (
          <div className="text-center py-12 text-muted-foreground text-xs">
            تعذر تحميل بيانات الطالب المحددة
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 1. Student Identity Hero */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-secondary/30 border border-border/60">
              <div className="flex items-center gap-3.5">
                <Avatar className="h-13 w-13 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-base font-bold">
                    {details.student.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-base font-black text-foreground">
                    {details.student.full_name}
                  </h3>
                  <p className="text-xs text-muted-foreground dir-ltr text-right font-mono">
                    @{details.student.username}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    آخر تسجيل دخول:{" "}
                    {details.student.last_login_at
                      ? formatRelativeTime(details.student.last_login_at)
                      : "لم يسجل الدخول بعد"}
                  </p>
                </div>
              </div>

              {onToggleStatus && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onToggleStatus(details.student.id, details.student.is_active)
                  }
                  className="rounded-2xl text-xs font-bold self-start sm:self-auto"
                >
                  {details.student.is_active ? "تعطيل الحساب" : "تفعيل الحساب"}
                </Button>
              )}
            </div>

            {/* 2. Key High-Level Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/60 text-center space-y-1">
                <span className="text-[11px] text-muted-foreground font-semibold block">معدل الإنجاز</span>
                <span className="text-xl font-black text-primary font-mono block">
                  {details.overallProgressPercentage}%
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {details.totalCompletedLectures} من {details.totalAssignedLectures} درس
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/60 text-center space-y-1">
                <span className="text-[11px] text-muted-foreground font-semibold block">وقت المذاكرة</span>
                <span className="text-lg font-black text-foreground block">
                  {details.totalStudySeconds > 0
                    ? formatDurationArabic(details.totalStudySeconds)
                    : "0 دقيقة"}
                </span>
                <span className="text-[10px] text-muted-foreground">جلسات تركيز موثقة</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/60 text-center space-y-1">
                <span className="text-[11px] text-muted-foreground font-semibold block">المواد المسندة</span>
                <span className="text-xl font-black text-foreground block font-mono">
                  {details.coursesBreakdown.length}
                </span>
                <span className="text-[10px] text-muted-foreground">مقررات دراسية</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/60 text-center space-y-1">
                <span className="text-[11px] text-muted-foreground font-semibold block">الامتحانات</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 block font-mono">
                  {details.completedExamsCount} / {details.totalExamsCount}
                </span>
                <span className="text-[10px] text-muted-foreground">اختبارات مجتازة</span>
              </div>
            </div>

            {/* 3. Course-by-Course Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>إنجاز الطالب في المواد الدراسية:</span>
              </h4>

              {details.coursesBreakdown.length === 0 ? (
                <div className="p-4 rounded-2xl border border-dashed border-border text-center text-xs text-muted-foreground">
                  لم يتم إسناد أي مواد دراسية لهذا الطالب بعد
                </div>
              ) : (
                <div className="space-y-2.5">
                  {details.coursesBreakdown.map((course) => (
                    <div
                      key={course.subjectId}
                      className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{course.name}</span>
                          {course.code && (
                            <span className="text-[10px] font-mono text-muted-foreground">
                              ({course.code})
                            </span>
                          )}
                        </div>
                        <span className="font-mono font-bold text-primary">
                          {course.progressPercentage}% ({course.completedContents} من {course.totalContents})
                        </span>
                      </div>
                      <Progress value={course.progressPercentage} className="h-2 bg-secondary" />
                      {course.studySeconds > 0 && (
                        <div className="text-[11px] text-muted-foreground">
                          وقت المذاكرة في هذه المادة: {formatDurationArabic(course.studySeconds)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Recently Completed Content */}
            {details.recentCompletions.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>آخر الدروس التي أتمها الطالب:</span>
                </h4>
                <div className="rounded-2xl border border-border/60 divide-y divide-border/50 overflow-hidden bg-card/60">
                  {details.recentCompletions.map((item, idx) => (
                    <div key={idx} className="p-3 text-xs flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-bold text-foreground block">{item.title}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {item.subjectName} • {item.type === "lecture" ? "محاضرة" : "سكشن"}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatRelativeTime(item.completedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Recent Activity Logs */}
            {details.recentActivities.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-amber-500" />
                  <span>سجل تفاعلات ونشاطات الطالب الأخيرة:</span>
                </h4>
                <div className="rounded-2xl border border-border/60 divide-y divide-border/50 overflow-hidden bg-card/40 text-xs">
                  {details.recentActivities.map((act) => (
                    <div key={act.id} className="p-3 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground block">
                          {act.action === "login"
                            ? "تسجيل دخول إلى المنصة"
                            : act.action === "complete_content"
                            ? "إكمال درس أو محاضرة"
                            : act.action === "study_session"
                            ? `جلسة مذاكرة (${act.metadata?.courseName || "مادة"})`
                            : act.action}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatRelativeTime(act.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
