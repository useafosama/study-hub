import * as React from "react";
import Link from "next/link";
import { getStudentDashboardData } from "@/actions/student";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { BookOpen, ArrowLeft, Layers } from "lucide-react";

export default async function StudentSubjectsPage() {
  const { subjects } = await getStudentDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          المواد الدراسية
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          جميع المقررات والمناهج المصرح لك بالوصول إليها
        </p>
      </div>

      {subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="لا توجد مواد مخصصة لك حالياً"
          description="لم يقم المشرف بتعيين أي مواد لحسابك بعد. يرجى مراجعة إدارة المنصة."
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
                        {subject.description || "تصفح المحاضرات والسكاشن والمرفقات"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span>الإنجاز الكلي</span>
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
  );
}
