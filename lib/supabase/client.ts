import { createBrowserClient } from "@supabase/ssr";
import { getCleanSupabaseUrl, getCleanAnonKey } from "./utils";

export function createClient() {
  const supabaseUrl = getCleanSupabaseUrl();
  const supabaseAnonKey = getCleanAnonKey();

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
