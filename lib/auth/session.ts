import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/database";

export interface CurrentUserSession {
  user: any;
  profile: Profile;
  isAdmin: boolean;
  isStudent: boolean;
}

/**
 * Gets the current authenticated session and profile on the server.
 * Returns null if user is not authenticated or account is disabled.
 */
export async function getCurrentUser(): Promise<CurrentUserSession | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !profile.is_active) {
    return null;
  }

  return {
    user,
    profile: profile as Profile,
    isAdmin: profile.role === "admin",
    isStudent: profile.role === "student",
  };
}

/**
 * Requires the current user to be an active admin.
 * Throws an error or returns null if not an admin.
 */
export async function requireAdmin(): Promise<CurrentUserSession> {
  const session = await getCurrentUser();
  if (!session || !session.isAdmin) {
    throw new Error("Unauthorized: Admin access required.");
  }
  return session;
}

/**
 * Requires the current user to be authenticated and active.
 */
export async function requireAuth(): Promise<CurrentUserSession> {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("Unauthorized: Authentication required.");
  }
  return session;
}
