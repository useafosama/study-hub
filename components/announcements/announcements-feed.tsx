"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { DetailedAnnouncement } from "@/types/database";
import {
  markAnnouncementAsReadAction,
  markAllAnnouncementsAsReadAction,
} from "@/actions/announcements";
import { AnnouncementCard } from "./announcement-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Bell,
  Search,
  CheckCheck,
  AlertTriangle,
  FileCheck,
  BookOpen,
  Filter,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface AnnouncementsFeedProps {
  initialAnnouncements: DetailedAnnouncement[];
  initialUnreadCount: number;
}

export function AnnouncementsFeed({
  initialAnnouncements,
  initialUnreadCount,
}: AnnouncementsFeedProps) {
  const searchParams = useSearchParams();
  const focusedIdFromUrl = searchParams.get("id");

  const [announcements, setAnnouncements] = React.useState<DetailedAnnouncement[]>(
    initialAnnouncements
  );
  const [unreadCount, setUnreadCount] = React.useState(initialUnreadCount);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<
    "all" | "unread" | "important" | "exams" | "courses"
  >("all");
  const [selectedSubject, setSelectedSubject] = React.useState<string>("all");
  const [isPending, setIsPending] = React.useState(false);

  React.useEffect(() => {
    setAnnouncements(initialAnnouncements);
    setUnreadCount(initialUnreadCount);
  }, [initialAnnouncements, initialUnreadCount]);

  // Handle URL deep-link to a specific announcement
  React.useEffect(() => {
    if (focusedIdFromUrl) {
      const target = announcements.find((a) => a.id === focusedIdFromUrl);
      if (target && !target.is_read) {
        handleMarkAsRead(focusedIdFromUrl);
      }
    }
  }, [focusedIdFromUrl]);

  // Extract distinct subjects for course filtering
  const distinctSubjects = React.useMemo(() => {
    const map = new Map<string, string>();
    announcements.forEach((a) => {
      if (a.subject_id && a.subject_name) {
        map.set(a.subject_id, a.subject_name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [announcements]);

  // Handle mark single as read
  const handleMarkAsRead = async (id: string) => {
    // Optimistic UI update
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await markAnnouncementAsReadAction(id);
    } catch {
      toast.error("فشل تحديث حالة الإعلان");
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    const unreadIds = announcements.filter((a) => !a.is_read).map((a) => a.id);
    if (unreadIds.length === 0) return;

    setIsPending(true);
    // Optimistic UI update
    setAnnouncements((prev) => prev.map((a) => ({ ...a, is_read: true })));
    setUnreadCount(0);

    try {
      await markAllAnnouncementsAsReadAction(unreadIds);
      toast.success("تم تحديد جميع الإعلانات كمقروءة");
    } catch {
      toast.error("حدث خطأ أثناء تحديث الإعلانات");
    } finally {
      setIsPending(false);
    }
  };

  // Filtered announcements
  const filteredAnnouncements = React.useMemo(() => {
    return announcements.filter((a) => {
      // 1. Tab filter
      if (activeTab === "unread" && a.is_read) return false;
      if (activeTab === "important" && a.priority === "normal") return false;
      if (activeTab === "exams" && a.type !== "exam") return false;
      if (activeTab === "courses" && a.type !== "course") return false;

      // 2. Subject filter
      if (selectedSubject !== "all" && a.subject_id !== selectedSubject) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inTitle = a.title.toLowerCase().includes(query);
        const inContent = a.clean_content.toLowerCase().includes(query);
        const inAuthor = a.author_name?.toLowerCase().includes(query) || false;
        const inSubject = a.subject_name?.toLowerCase().includes(query) || false;

        if (!inTitle && !inContent && !inAuthor && !inSubject) {
          return false;
        }
      }

      return true;
    });
  }, [announcements, activeTab, selectedSubject, searchQuery]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
              مركز الإعلانات والتنبيهات
            </h1>
            {unreadCount > 0 && (
              <span className="bg-primary/15 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full border border-primary/20">
                {unreadCount} غير مقروء
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            مستجدات المواد الدراسية، مواعيد الامتحانات، والتنبيهات الهامة من إدارة المنصة
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={isPending}
            className="h-9 gap-1.5 rounded-2xl text-xs font-semibold cursor-pointer border-border hover:bg-secondary/60 self-start sm:self-auto"
          >
            <CheckCheck className="h-4 w-4 text-primary" />
            <span>تحديد الكل كمقروء</span>
          </Button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ابحث في الإعلانات، المواد، أو التنبيهات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 pl-9 h-11 rounded-2xl bg-secondary/30 border-border/70 text-sm focus:ring-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Tabs & Subject Filter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* Main Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              الكل ({announcements.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("unread")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "unread"
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <span>غير مقروء</span>
              {unreadCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === "unread" ? "bg-background text-foreground" : "bg-primary text-primary-foreground font-bold"
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("important")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === "important"
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <span>هامة وعاجلة</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("exams")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === "exams"
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <FileCheck className="h-3 w-3 text-purple-400" />
              <span>الامتحانات</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("courses")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === "courses"
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <BookOpen className="h-3 w-3 text-primary" />
              <span>المواد</span>
            </button>
          </div>

          {/* Subject Filter Dropdown if courses exist */}
          {distinctSubjects.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="h-8 px-2.5 py-1 text-xs rounded-xl bg-secondary/50 border border-border/70 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="all">جميع المواد</option>
                {distinctSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={
            searchQuery || activeTab !== "all" || selectedSubject !== "all"
              ? "لا توجد نتائج مطابقة لخيارات الفلترة"
              : "لا توجد إعلانات حالياً"
          }
          description={
            searchQuery || activeTab !== "all" || selectedSubject !== "all"
              ? "جرّب تغيير كلمات البحث أو إعادة ضبط خيارات التصفية لعرض الإعلانات الأخرى"
              : "ستظهر هنا كافة التنبيهات المنشورة من قبل مشرف المنصة فور نشرها"
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((a) => (
            <AnnouncementCard
              key={a.id}
              announcement={a}
              isFocused={a.id === focusedIdFromUrl}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
