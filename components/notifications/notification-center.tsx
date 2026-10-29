"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  PlayCircle,
  FileText,
  HelpCircle,
  Clock,
  Trophy,
  BookOpen,
  Sparkles,
  Settings2,
  CheckCircle2,
  ChevronLeft,
  Filter,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import {
  NotificationItem,
  NotificationPreferences,
  NotificationType,
} from "@/types/database";
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  saveNotificationPreferencesAction,
} from "@/actions/notifications";
import {
  getStoredReadIds,
  markStoredNotificationAsRead,
  markAllStoredNotificationsAsRead,
  getStoredNotificationPreferences,
  saveStoredNotificationPreferences,
  filterNotificationsByPreferences,
} from "@/lib/storage/notifications";

interface NotificationCenterProps {
  initialNotifications: NotificationItem[];
  initialUnreadCount: number;
  initialPreferences: NotificationPreferences;
}

export function NotificationCenter({
  initialNotifications,
  initialUnreadCount,
  initialPreferences,
}: NotificationCenterProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"all" | "unread" | "read">("all");
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(initialNotifications);
  const [preferences, setPreferences] = React.useState<NotificationPreferences>(initialPreferences);
  const [isPreferencesOpen, setIsPreferencesOpen] = React.useState(false);
  const [isMarkingAll, setIsMarkingAll] = React.useState(false);

  // Client hydration: sync with local read states
  React.useEffect(() => {
    const localReadIds = getStoredReadIds();
    const localPrefs = getStoredNotificationPreferences();
    setPreferences(localPrefs);

    if (localReadIds.size > 0) {
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read: n.read || localReadIds.has(n.id),
        }))
      );
    }
  }, []);

  // Filter based on user preferences
  const visibleNotifications = React.useMemo(() => {
    return filterNotificationsByPreferences(notifications, preferences);
  }, [notifications, preferences]);

  // Tab filtering
  const filteredNotifications = React.useMemo(() => {
    switch (activeTab) {
      case "unread":
        return visibleNotifications.filter((n) => !n.read);
      case "read":
        return visibleNotifications.filter((n) => n.read);
      case "all":
      default:
        return visibleNotifications;
    }
  }, [visibleNotifications, activeTab]);

  const unreadCount = visibleNotifications.filter((n) => !n.read).length;

  // Handle Mark Single as Read
  const handleMarkAsRead = async (item: NotificationItem) => {
    if (!item.read) {
      markStoredNotificationAsRead(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
      try {
        await markNotificationAsReadAction(item.id);
      } catch (err) {
        console.debug("Server sync read error", err);
      }
    }

    // Smart Routing: navigate to the notification target link
    if (item.link) {
      router.push(item.link);
    }
  };

  // Handle Mark All as Read
  const handleMarkAllAsRead = async () => {
    const unreadIds = visibleNotifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    setIsMarkingAll(true);
    markAllStoredNotificationsAsRead(unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await markAllNotificationsAsReadAction(unreadIds);
      toast.success("تم تحديد جميع الإشعارات كمقروءة ✓");
    } catch (err) {
      console.debug("Mark all error:", err);
      toast.success("تم تحديث الإشعارات كمقروءة");
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Handle Toggle Preference
  const handleTogglePreference = async (key: keyof NotificationPreferences) => {
    const updated: NotificationPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(updated);
    saveStoredNotificationPreferences(updated);
    try {
      await saveNotificationPreferencesAction(updated);
      toast.success("تم حفظ تفضيلات الإشعارات");
    } catch {
      // Local storage saved
    }
  };

  // Icon and badge styling by notification type
  const getTypeConfig = (type: NotificationType) => {
    switch (type) {
      case "new_lecture":
        return {
          icon: PlayCircle,
          label: "محاضرة جديدة",
          colorClass: "bg-blue-500/10 text-primary border-primary/20",
          badgeVariant: "default" as const,
        };
      case "new_resource":
        return {
          icon: FileText,
          label: "مذكرة / ملف",
          colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          badgeVariant: "warning" as const,
        };
      case "new_quiz":
        return {
          icon: HelpCircle,
          label: "امتحان / تقييم",
          colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
          badgeVariant: "purple" as const,
        };
      case "announcement":
        return {
          icon: Bell,
          label: "إعلان رسمي",
          colorClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
          badgeVariant: "warning" as const,
        };
      case "study_reminder":
        return {
          icon: Clock,
          label: "تذكير مذاكرة",
          colorClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
          badgeVariant: "secondary" as const,
        };
      case "milestone":
        return {
          icon: Trophy,
          label: "إنجاز أكاديمي",
          colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          badgeVariant: "success" as const,
        };
      case "course_update":
        return {
          icon: BookOpen,
          label: "تحديث مادة",
          colorClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
          badgeVariant: "secondary" as const,
        };
      case "system":
      default:
        return {
          icon: Sparkles,
          label: "تنبيه نظام",
          colorClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
          badgeVariant: "destructive" as const,
        };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* 1. Header Bar with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              مركز الإشعارات والتنبيهات 🔔
            </h1>
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground font-bold text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                {unreadCount} غير مقروء
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            تابع آخر التحديثات الأكاديمية والمحاضرات الجديدة والإعلانات المهمة
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              disabled={isMarkingAll}
              onClick={handleMarkAllAsRead}
              className="rounded-2xl text-xs font-semibold gap-1.5 h-10 border-border/80 bg-card/60 hover:bg-card shadow-xs"
            >
              <CheckCheck className="h-4 w-4 text-primary" />
              <span>تحديد الكل كمقروء</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreferencesOpen(true)}
            className="rounded-2xl text-xs font-semibold gap-1.5 h-10 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          >
            <Settings2 className="h-4 w-4" />
            <span>تفضيلات الإشعارات</span>
          </Button>
        </div>
      </div>

      {/* 2. Tabs Selector (All / Unread / Read) */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "all"
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
          }`}
        >
          <span>الكل</span>
          <span
            className={`text-xs px-1.5 py-0.2 rounded-full ${
              activeTab === "all" ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"
            }`}
          >
            {visibleNotifications.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("unread")}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "unread"
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
          }`}
        >
          <span>غير المقروءة</span>
          {unreadCount > 0 && (
            <span
              className={`text-xs px-1.5 py-0.2 rounded-full ${
                activeTab === "unread"
                  ? "bg-white/20 text-white"
                  : "bg-primary/10 text-primary font-black"
              }`}
            >
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("read")}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "read"
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
          }`}
        >
          <span>المقروءة</span>
        </button>
      </div>

      {/* 3. Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="rounded-3xl border border-dashed border-border/80 p-10 text-center bg-card/40 space-y-3">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {activeTab === "unread"
                  ? "رائع! لا توجد إشعارات غير مقروءة حالياً"
                  : activeTab === "read"
                  ? "لا توجد إشعارات في سجل المقروءة"
                  : "لا توجد أي إشعارات مسجلة"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {activeTab === "unread"
                  ? "أنت مطلع على كافة التحديثات والدروس الجديدة أولاً بأول."
                  : "ستظهر هنا كافة تنبيهات المحاضرات والمذكرات عند نشرها."}
              </p>
            </div>
            {activeTab !== "all" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("all")}
                className="rounded-2xl text-xs mt-2"
              >
                عرض كافة الإشعارات
              </Button>
            )}
          </Card>
        ) : (
          filteredNotifications.map((item) => {
            const config = getTypeConfig(item.type);
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                onClick={() => handleMarkAsRead(item)}
                className={`group relative rounded-3xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                  !item.read
                    ? "bg-card/90 hover:bg-card border-primary/30 shadow-md shadow-primary/5 hover:border-primary/50"
                    : "bg-card/50 hover:bg-card/80 border-border/60 hover:border-border"
                }`}
              >
                {/* Unread indicator dot */}
                {!item.read && (
                  <span className="absolute top-4 left-4 flex h-2 w-2 rounded-full bg-primary ring-4 ring-primary/20" />
                )}

                {/* Type Icon */}
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-xs transition-transform group-hover:scale-105 ${config.colorClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5 text-right">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={config.badgeVariant} className="text-[10px] py-0 px-2 font-bold">
                      {config.label}
                    </Badge>
                    <span
                      className={`text-sm sm:text-base tracking-tight truncate ${
                        !item.read ? "font-black text-foreground" : "font-semibold text-foreground/85"
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                    <span className="font-medium">{formatRelativeTime(item.createdAt)}</span>
                    {item.link && (
                      <span className="text-primary font-bold inline-flex items-center gap-1 group-hover:underline">
                        <span>فتح الرابط</span>
                        <ChevronLeft className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Notification Preferences Dialog */}
      <Dialog open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              <span>تفضيلات وقنوات الإشعارات</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              حدد أنواع التنبيهات التي ترغب في تلقيها ومتابعتها على المنصة
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* New Lectures */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 border border-border/50">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground block">
                  المحاضرات والسكاشن الجديدة
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  تنبيه عند رفع محاضرة أو درس جديد بموادك
                </span>
              </div>
              <Switch
                checked={preferences.new_lectures}
                onCheckedChange={() => handleTogglePreference("new_lectures")}
              />
            </div>

            {/* New Resources */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 border border-border/50">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground block">
                  المذكرات والملفات (PDF)
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  إشعار عند إضافة ملخص أو مذكرة جديدة
                </span>
              </div>
              <Switch
                checked={preferences.new_resources}
                onCheckedChange={() => handleTogglePreference("new_resources")}
              />
            </div>

            {/* Announcements */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 border border-border/50">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground block">
                  الإعلانات الرسمية والتنبيهات
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  توجيهات وملاحظات الأستاذ يوسف أسامة
                </span>
              </div>
              <Switch
                checked={preferences.announcements}
                onCheckedChange={() => handleTogglePreference("announcements")}
              />
            </div>

            {/* Quizzes */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 border border-border/50">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground block">
                  الامتحانات والتقييمات التفاعلية
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  تنبيه عند إتاحة امتحان جديد أو بنك أسئلة
                </span>
              </div>
              <Switch
                checked={preferences.quiz_notifications}
                onCheckedChange={() => handleTogglePreference("quiz_notifications")}
              />
            </div>

            {/* Study Reminders */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 border border-border/50">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground block">
                  تذكيرات خطة وجدول المذاكرة
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  تذكيرات بمهام وجداول المذاكرة المجدولة
                </span>
              </div>
              <Switch
                checked={preferences.study_reminders}
                onCheckedChange={() => handleTogglePreference("study_reminders")}
              />
            </div>

            {/* Progress Milestones */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 border border-border/50">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground block">
                  إنجازات التقدم والأوسمة
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  الاحتفال بإتمام المواد وتحقيق أرقام متتالية
                </span>
              </div>
              <Switch
                checked={preferences.progress_milestones}
                onCheckedChange={() => handleTogglePreference("progress_milestones")}
              />
            </div>

            <Button
              onClick={() => setIsPreferencesOpen(false)}
              className="w-full rounded-2xl text-xs font-bold h-11 bg-primary text-primary-foreground"
            >
              تم وحفظ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
