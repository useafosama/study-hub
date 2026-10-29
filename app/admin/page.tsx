import * as React from "react";
import { Metadata } from "next";
import { getAdminOverviewData } from "@/actions/admin";
import { AdminControlCenter } from "@/components/admin/admin-control-center";

export const metadata: Metadata = {
  title: "لوحة تحكم المشرف | منصة الچوو",
  description: "مركز التحكم والإدارة الأكاديمية الشامل لمنصة الچوو التعليمية",
};

export default async function AdminDashboardPage() {
  const data = await getAdminOverviewData();

  return <AdminControlCenter data={data} />;
}
