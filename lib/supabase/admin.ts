import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getCleanSupabaseUrl, getCleanServiceRoleKey } from "./utils";

export function createAdminClient() {
  const supabaseUrl = getCleanSupabaseUrl();
  const serviceRoleKey = getCleanServiceRoleKey();

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
