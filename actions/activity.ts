"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { ActivityLog } from "@/types/database";

export async function getActivityLogs(limit = 50): Promise<ActivityLog[]> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: logs, error } = await supabase
    .from("activity_logs")
    .select(`
      id,
      user_id,
      action,
      entity_type,
      entity_id,
      metadata,
      created_at,
      profiles (
        full_name,
        username
      )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch activity logs:", error);
    return [];
  }

  return logs.map((l: any) => ({
    ...l,
    user_full_name: l.profiles?.full_name || "مستخدم غير معروف",
    user_username: l.profiles?.username || "unknown",
  })) as ActivityLog[];
}
