import * as React from "react";
import { getStudentDashboardData } from "@/actions/student";
import { ProfileView } from "@/components/student/profile-view";

export default async function StudentProfilePage() {
  const { profile, subjects } = await getStudentDashboardData();

  return <ProfileView profile={profile} assignedSubjects={subjects} />;
}
