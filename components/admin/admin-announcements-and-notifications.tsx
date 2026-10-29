"use client";

import * as React from "react";
import { Bell, Send } from "lucide-react";
import { DetailedAnnouncement, Subject } from "@/types/database";
import { AnnouncementsManager } from "./announcements-manager";
import { AdminNotificationDispatcher } from "./admin-notification-dispatcher";

interface AdminAnnouncementsAndNotificationsProps {
  initialAnnouncements: DetailedAnnouncement[];
  subjects: Subject[];
  students: { id: string; full_name: string; username: string }[];
}

export function AdminAnnouncementsAndNotifications({
  initialAnnouncements,
  subjects,
  students,
}: AdminAnnouncementsAndNotificationsProps) {
  const [activeTab, setActiveTab] = React.useState<"announcements" | "dispatcher">("announcements");

  return (
    <div className="space-y-6">
      {/* Top Tab Bar */}
      <div className="flex items-center gap-2 border-b border-border/70 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("announcements")}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "announcements"
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>إدارة الإعلانات المنشورة</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === "announcements"
                ? "bg-white/20 text-white"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {initialAnnouncements.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dispatcher")}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "dispatcher"
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
          }`}
        >
          <Send className="h-4 w-4" />
          <span>إرسال إشعار فوري للطلاب</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "announcements" ? (
        <AnnouncementsManager
          initialAnnouncements={initialAnnouncements}
          subjects={subjects}
          students={students}
        />
      ) : (
        <AdminNotificationDispatcher
          subjects={subjects}
          students={students}
        />
      )}
    </div>
  );
}
