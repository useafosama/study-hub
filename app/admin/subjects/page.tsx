import * as React from "react";
import { getAdminSubjects } from "@/actions/subjects";
import { SubjectsManager } from "@/components/admin/subjects-manager";

export default async function AdminSubjectsPage() {
  const subjects = await getAdminSubjects();

  return <SubjectsManager initialSubjects={subjects} />;
}
