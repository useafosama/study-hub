import * as React from "react";
import { getAdminAnnouncements } from "@/actions/announcements";
import { getAdminSubjects } from "@/actions/subjects";
import { AnnouncementsManager } from "@/components/admin/announcements-manager";

export default async function AdminAnnouncementsPage() {
  const [announcements, subjects] = await Promise.all([
    getAdminAnnouncements(),
    getAdminSubjects(),
  ]);

  return (
    <AnnouncementsManager
      initialAnnouncements={announcements}
      subjects={subjects}
    />
  );
}
