import * as React from "react";
import { getStudentAnnouncements } from "@/actions/announcements";
import { AnnouncementsFeed } from "@/components/announcements/announcements-feed";

export const metadata = {
  title: "مركز الإعلانات والتنبيهات | Study Hub",
  description: "تابع مستجدات المواد والامتحانات والتنبيهات الهامة من إدارة المنصة",
};

export default async function StudentAnnouncementsPage() {
  const { announcements, unreadCount } = await getStudentAnnouncements();

  return (
    <React.Suspense fallback={<div className="h-64 flex items-center justify-center text-sm text-muted-foreground">جاري تحميل الإعلانات...</div>}>
      <AnnouncementsFeed
        initialAnnouncements={announcements}
        initialUnreadCount={unreadCount}
      />
    </React.Suspense>
  );
}
