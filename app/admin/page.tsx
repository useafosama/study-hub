import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActivityLogs } from "@/actions/activity";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
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
} from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch summary counts
  const [
    { count: usersCount },
    { count: subjectsCount },
    { count: lecturesCount },
    { count: sectionsCount },
    { count: resourcesCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("subjects").select("*", { count: "exact", head: true }),
    supabase.from("contents").select("*", { count: "exact", head: true }).eq("type", "lecture"),
    supabase.from("contents").select("*", { count: "exact", head: true }).eq("type", "section"),
    supabase.from("resources").select("*", { count: "exact", head: true }),
  ]);

  // Fetch recent contents
  const { data: recentContents } = await supabase
    .from("contents")
    .select(`
      id,
      title,
      type,
      is_published,
      created_at,
      subjects (
        id,
        name,
        code
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch recent activity logs
  const activityLogs = await getActivityLogs(6);

  const stats = [
    {
      title: "المستخدمين والطلاب",
      value: usersCount || 0,
      icon: Users,
      href: "/admin/users",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      title: "المواد الدراسية",
      value: subjectsCount || 0,
      icon: BookOpen,
      href: "/admin/subjects",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      title: "المحاضرات",
      value: lecturesCount || 0,
      icon: Video,
      href: "/admin/subjects",
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-950/40",
    },
    {
      title: "الأقسام والسكاشن",
      value: sectionsCount || 0,
      icon: Layers,
      href: "/admin/subjects",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
    },
    {
      title: "المرفقات (فيديو / PDF)",
      value: resourcesCount || 0,
      icon: FileText,
      href: "/admin/subjects",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/40",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            لوحة الإدارة والمتابعة
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            نظرة عامة على المواد، الطلاب، المحتوى، والنشاطات الحديثة
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button asChild size="sm" className="rounded-xl shadow-sm">
            <Link href="/admin/users">
              <Plus className="ml-1.5 h-4 w-4" />
              إضافة طالب
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link href="/admin/subjects">
              <Plus className="ml-1.5 h-4 w-4" />
              إضافة مادة
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 md:gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link key={idx} href={stat.href} className="group">
              <Card className="apple-card apple-card-hover h-full p-4 md:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {stat.title}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Main Grid: Recent Content & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Content Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              أحدث المحتويات المضافة
            </h2>
            <Link
              href="/admin/subjects"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              عرض الكل
            </Link>
          </div>

          <Card className="rounded-2xl border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
            {recentContents && recentContents.length > 0 ? (
              recentContents.map((content: any) => (
                <div
                  key={content.id}
                  className="flex items-center justify-between p-4 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {content.title}
                      </span>
                      <Badge variant={content.is_published ? "success" : "secondary"}>
                        {content.is_published ? "منشور" : "مسودة"}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {(content.subjects as any)?.name} • {content.type === "lecture" ? "محاضرة" : "سكشن"}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-400 shrink-0">
                    {formatRelativeTime(content.created_at)}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-zinc-400">
                لا يوجد محتوى مضاف حتى الآن
              </div>
            )}
          </Card>
        </div>

        {/* Activity Feed Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-500" />
              النشاطات الأخيرة
            </h2>
            <Link
              href="/admin/activity"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              عرض السجل الكامل
            </Link>
          </div>

          <Card className="rounded-2xl border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
            {activityLogs && activityLogs.length > 0 ? (
              activityLogs.map((log) => (
                <div key={log.id} className="p-3.5 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {log.user_full_name}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {formatRelativeTime(log.created_at)}
                    </span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {log.action === "create_user" && "قام بإنشاء مستخدم جديد"}
                    {log.action === "update_user" && "قام بتعديل بيانات مستخدم"}
                    {log.action === "delete_user" && "قام بحذف حساب مستخدم"}
                    {log.action === "create_subject" && "قام بإنشاء مادة جديدة"}
                    {log.action === "update_subject" && "قام بتحديث مادة"}
                    {log.action === "create_content" && "أضاف محتوى جديد"}
                    {log.action === "update_content" && "حدّث محتوى"}
                    {log.action === "create_announcement" && "نشر إعلاناً جديداً"}
                    {log.action === "login" && "سجل دخوله إلى المنصة"}
                    {!["create_user", "update_user", "delete_user", "create_subject", "update_subject", "create_content", "update_content", "create_announcement", "login"].includes(log.action) && log.action}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-zinc-400">
                لا توجد نشاطات مسجلة بعد
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
