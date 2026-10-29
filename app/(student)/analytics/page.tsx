import * as React from "react";
import { Metadata } from "next";
import { getStudentAnalyticsData } from "@/actions/student";
import { AnalyticsDashboard } from "@/components/student/analytics-dashboard";

export const metadata: Metadata = {
  title: "تحليلات التعلم والمذاكرة | منصة الچوو",
  description: "لوحة تحليلات تقدم الطالب وساعات المذاكرة الموثقة ونسب إنجاز المواد",
};

export default async function StudentAnalyticsPage() {
  const data = await getStudentAnalyticsData();

  return <AnalyticsDashboard initialData={data} />;
}
