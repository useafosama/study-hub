import * as React from "react";
import { Metadata } from "next";
import { getStudentNotifications } from "@/actions/notifications";
import { NotificationCenter } from "@/components/notifications/notification-center";

export const metadata: Metadata = {
  title: "مركز الإشعارات والتنبيهات | منصة الچوو",
  description: "مركز الإشعارات الأكاديمية والتنبيهات الرسمية لمنصة الچوو التعليمية",
};

export default async function StudentNotificationsPage() {
  const data = await getStudentNotifications();

  return (
    <NotificationCenter
      initialNotifications={data.notifications}
      initialUnreadCount={data.unreadCount}
      initialPreferences={data.preferences}
    />
  );
}
