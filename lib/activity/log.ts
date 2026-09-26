import { createClient } from "@/lib/supabase/server";

export interface LogActivityParams {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, any>;
}

export async function logActivity({
  userId,
  action,
  entityType,
  entityId,
  metadata = {},
}: LogActivityParams): Promise<void> {
  try {
    const supabase = await createClient();

    let actualUserId = userId;
    if (!actualUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      actualUserId = user?.id || null;
    }

    await supabase.from("activity_logs").insert({
      user_id: actualUserId,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      metadata,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
