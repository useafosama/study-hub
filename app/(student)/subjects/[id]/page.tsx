import * as React from "react";
import { notFound } from "next/navigation";
import { getStudentSubject } from "@/actions/student";
import { SubjectView } from "@/components/student/subject-view";

export default async function StudentSubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const subjectId = resolvedParams.id;

  const data = await getStudentSubject(subjectId);

  if (!data || !data.subject) {
    notFound();
  }

  return (
    <SubjectView
      subject={data.subject}
      lectures={data.lectures}
      sections={data.sections}
      totalCount={data.totalCount || 0}
      completedCount={data.completedCount || 0}
      progressPercentage={data.progressPercentage || 0}
    />
  );
}
