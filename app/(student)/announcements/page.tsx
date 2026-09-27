import * as React from "react";
import { getStudentDashboardData } from "@/actions/student";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { Bell, Globe, BookOpen } from "lucide-react";

export default async function StudentAnnouncementsPage() {
  const { announcements } = await getStudentDashboardData();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          الإعلانات والتنبيهات
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          آخر الأخبار، تنبيهات المحاضرات، والمستجدات الخاصة بدراستك
        </p>
      </div>

      {announcements.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="لا توجد إعلانات حالياً"
          description="ستظهر هنا كافة التنبيهات المنشورة من قبل مشرف المنصة فور نشرها"
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <Card key={a.id} className="apple-card p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
                <div className="flex items-center gap-2">
                  {a.target_type === "all" ? (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Globe className="h-3 w-3" />
                      إعلان عام
                    </Badge>
                  ) : (
                    <Badge variant="purple" className="gap-1 text-xs">
                      <BookOpen className="h-3 w-3" />
                      مادة: {a.subject_name}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(a.created_at)} ({formatRelativeTime(a.created_at)})
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground">
                  {a.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 whitespace-pre-wrap leading-relaxed">
                  {a.content}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
