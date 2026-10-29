import * as React from "react";
import { getAdminAnnouncements } from "@/actions/announcements";
import { getAdminSubjects } from "@/actions/subjects";
import { getUsersList } from "@/actions/users";
import { AdminAnnouncementsAndNotifications } from "@/components/admin/admin-announcements-and-notifications";

export default async function AdminAnnouncementsPage() {
  const [announcements, subjects, users] = await Promise.all([
    getAdminAnnouncements(),
    getAdminSubjects(),
    getUsersList(),
  ]);

  const students = users
    .filter((u: any) => u.role === "student" || !u.role)
    .map((u: any) => ({
      id: u.id,
      full_name: u.full_name,
      username: u.username,
    }));

  return (
    <AdminAnnouncementsAndNotifications
      initialAnnouncements={announcements}
      subjects={subjects}
      students={students}
    />
  );
}
