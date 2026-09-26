/**
 * Authentication helper utilities.
 * Handles mapping between user-facing clean usernames and internal Supabase Auth email identities.
 */

const INTERNAL_AUTH_DOMAIN = "studyhub.internal";

/**
 * Converts a username or full email to an internal email for Supabase Auth.
 * e.g.:
 *   "admin" -> "admin@studyhub.internal"
 *   "khaled" -> "khaled@studyhub.internal"
 *   "salama" -> "salama@studyhub.internal"
 *   "admin@studyhub.internal" -> "admin@studyhub.internal"
 *   "user@example.com" -> "user@example.com"
 */
export function usernameToInternalEmail(input: string): string {
  if (!input || typeof input !== "string") return "";

  const trimmed = input.trim().toLowerCase();

  // If already contains '@', do not append domain again
  if (trimmed.includes("@")) {
    return trimmed;
  }

  // Clean username and append domain
  const sanitized = trimmed.replace(/[^a-z0-9_.-]/g, "_");
  return `${sanitized}@${INTERNAL_AUTH_DOMAIN}`;
}

/**
 * Extracts the user-facing username from an internal email, if applicable.
 */
export function internalEmailToUsername(email: string): string {
  if (!email || typeof email !== "string") return "";

  const trimmed = email.trim();
  if (trimmed.toLowerCase().endsWith(`@${INTERNAL_AUTH_DOMAIN}`)) {
    return trimmed.slice(0, -(INTERNAL_AUTH_DOMAIN.length + 1));
  }
  return trimmed.split("@")[0] || trimmed;
}

/**
 * Validates a username format.
 * Must be alphanumeric, underscores, hyphens, dots, 3-60 characters.
 */
export function isValidUsername(username: string): boolean {
  if (!username || typeof username !== "string") return false;
  return /^[a-zA-Z0-9_.-]{3,60}$/.test(username.trim());
}
