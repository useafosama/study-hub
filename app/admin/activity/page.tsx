import * as React from "react";
import { getActivityLogs } from "@/actions/activity";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { Activity, Shield, User, Clock, FileText } from "lucide-react";

export default async function AdminActivityPage() {
  const logs = await getActivityLogs(100);

  const getActionDetails = (action: string) => {
    switch (action) {
      case "login":
        return { label: "تسجيل دخول", variant: "secondary" as const };
      case "create_user":
        return { label: "إنشاء مستخدم", variant: "purple" as const };
      case "update_user":
        return { label: "تعديل مستخدم", variant: "outline" as const };
      case "delete_user":
        return { label: "حذف مستخدم", variant: "destructive" as const };
      case "enable_user":
        return { label: "تفعيل مستخدم", variant: "success" as const };
      case "disable_user":
        return { label: "تعطيل مستخدم", variant: "warning" as const };
      case "create_subject":
        return { label: "إنشاء مادة", variant: "default" as const };
      case "update_subject":
        return { label: "تعديل مادة", variant: "outline" as const };
      case "delete_subject":
        return { label: "حذف مادة", variant: "destructive" as const };
      case "publish_subject":
        return { label: "نشر مادة", variant: "success" as const };
      case "hide_subject":
        return { label: "إخفاء مادة", variant: "warning" as const };
      case "reorder_subjects":
        return { label: "إعادة ترتيب المواد", variant: "secondary" as const };
      case "create_content":
        return { label: "إضافة محتوى", variant: "default" as const };
      case "update_content":
        return { label: "تعديل محتوى", variant: "outline" as const };
      case "delete_content":
        return { label: "حذف محتوى", variant: "destructive" as const };
      case "publish_content":
        return { label: "نشر محتوى", variant: "success" as const };
      case "hide_content":
        return { label: "إخفاء محتوى", variant: "warning" as const };
      case "reorder_content":
        return { label: "إعادة ترتيب المحتوى", variant: "secondary" as const };
      case "create_announcement":
        return { label: "نشر إعلان", variant: "purple" as const };
      case "update_settings":
        return { label: "تحديث الإعدادات", variant: "default" as const };
      default:
        return { label: action, variant: "secondary" as const };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          سجل نشاطات النظام
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          سجل تدقيق كامل للعمليات الإدارية وتفاعلات المستخدمين على المنصة
        </p>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="لا توجد نشاطات مسجلة حتى الآن"
          description="ستظهر هنا كافة العمليات والإجراءات الإدارية المنجزة في المنصة"
        />
      ) : (
        <Card className="rounded-2xl border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
          {logs.map((log) => {
            const actionInfo = getActionDetails(log.action);
            return (
              <div
                key={log.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors text-xs"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={actionInfo.variant} className="text-[10px]">
                        {actionInfo.label}
                      </Badge>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {log.user_full_name}
                      </span>
                      <span className="text-[11px] text-zinc-400 dir-ltr text-right">
                        (@{log.user_username})
                      </span>
                    </div>

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                        {log.metadata.title && `العنوان: "${log.metadata.title}" `}
                        {log.metadata.name && `الاسم: "${log.metadata.name}" `}
                        {log.metadata.username && `اسم المستخدم: "${log.metadata.username}" `}
                        {log.metadata.count && `عدد العناصر: ${log.metadata.count}`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] self-end sm:self-center shrink-0">
                  <Clock className="h-3.5 w-3.5" />
                  <span title={formatDate(log.created_at)}>
                    {formatRelativeTime(log.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
