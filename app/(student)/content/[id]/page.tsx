import * as React from "react";
import { notFound } from "next/navigation";
import { getStudentContent } from "@/actions/student";
import { ContentViewer } from "@/components/student/content-viewer";

export default async function StudentContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const contentId = resolvedParams.id;

  const data = await getStudentContent(contentId);

  if (!data || !data.content || !data.subject) {
    notFound();
  }

  return (
    <ContentViewer
      content={data.content as any}
      subject={data.subject as any}
      prevContent={data.prevContent}
      nextContent={data.nextContent}
    />
  );
}
