import { NotificationItem, NotificationPreferences } from "@/types/database";

const READ_NOTIFICATIONS_STORAGE_KEY = "studyhub_read_notification_ids";
const NOTIFICATION_PREFERENCES_STORAGE_KEY = "studyhub_notification_preferences";

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  new_lectures: true,
  new_resources: true,
  announcements: true,
  quiz_notifications: true,
  study_reminders: true,
  progress_milestones: true,
};

/**
 * Get IDs of notifications marked as read in local storage.
 */
export function getStoredReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(READ_NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (err) {
    console.error("Error reading stored read notification IDs:", err);
    return new Set();
  }
}

/**
 * Mark a single notification as read in local storage.
 */
export function markStoredNotificationAsRead(id: string): void {
  if (typeof window === "undefined" || !id) return;
  try {
    const existing = getStoredReadIds();
    existing.add(id);
    localStorage.setItem(
      READ_NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(Array.from(existing))
    );
  } catch (err) {
    console.error("Error saving read notification ID:", err);
  }
}

/**
 * Mark all given notification IDs as read in local storage.
 */
export function markAllStoredNotificationsAsRead(ids: string[]): void {
  if (typeof window === "undefined" || !ids || ids.length === 0) return;
  try {
    const existing = getStoredReadIds();
    ids.forEach((id) => existing.add(id));
    localStorage.setItem(
      READ_NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(Array.from(existing))
    );
  } catch (err) {
    console.error("Error saving all read notification IDs:", err);
  }
}

/**
 * Get notification preferences from local storage.
 */
export function getStoredNotificationPreferences(): NotificationPreferences {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_PREFERENCES;
  try {
    const raw = localStorage.getItem(NOTIFICATION_PREFERENCES_STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFERENCES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...parsed };
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

/**
 * Save notification preferences to local storage.
 */
export function saveStoredNotificationPreferences(
  preferences: NotificationPreferences
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      NOTIFICATION_PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences)
    );
  } catch (err) {
    console.error("Error saving notification preferences:", err);
  }
}

/**
 * Filter notifications based on user preferences.
 */
export function filterNotificationsByPreferences(
  notifications: NotificationItem[],
  prefs: NotificationPreferences
): NotificationItem[] {
  return notifications.filter((item) => {
    switch (item.type) {
      case "new_lecture":
        return prefs.new_lectures;
      case "new_resource":
        return prefs.new_resources;
      case "announcement":
        return prefs.announcements;
      case "new_quiz":
        return prefs.quiz_notifications;
      case "study_reminder":
        return prefs.study_reminders;
      case "milestone":
        return prefs.progress_milestones;
      case "course_update":
      case "system":
      default:
        return true; // System & course updates always shown
    }
  });
}
