import * as React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { getSubjectContents } from "@/actions/content";
import { ContentManager } from "@/components/admin/content-manager";
import { Subject } from "@/types/database";

export default async function AdminSubjectContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const resolvedParams = await params;
  const subjectId = resolvedParams.id;

  const supabase = await createClient();

  const { data: subject, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", subjectId)
    .single();

  if (error || !subject) {
    notFound();
  }

  const contents = await getSubjectContents(subjectId);

  return <ContentManager subject={subject as Subject} initialContents={contents} />;
}
