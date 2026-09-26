/**
 * Cleans and formats Supabase URL and keys, removing trailing slashes,
 * accidental '/rest/v1' paths, and whitespace.
 */
export function getCleanSupabaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  url = url.trim().replace(/\/+$/, "");
  url = url.replace(/\/rest\/v1\/?$/i, "");
  return url;
}

export function getCleanAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
  return key.trim();
}

export function getCleanServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";
  return key.replace(/[\r\n\s]+/g, "").trim();
}
