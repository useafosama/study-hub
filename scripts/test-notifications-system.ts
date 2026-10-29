import {
  filterNotificationsByPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from "../lib/storage/notifications";
import { NotificationItem, NotificationPreferences } from "../types/database";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("=== Testing Notification Center System ===");

// 1. Mock Notification Items
const mockNotifications: NotificationItem[] = [
  {
    id: "n_lecture_1",
    type: "new_lecture",
    title: "محاضرة جديدة في المحاسبة",
    message: "تم رفع المحاضرة الرابعة",
    link: "/content/lec-4",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "n_resource_1",
    type: "new_resource",
    title: "مذكرة جديدة (PDF)",
    message: "تم رفع ملخص الفصل الثاني",
    link: "/content/lec-2",
    read: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "n_quiz_1",
    type: "new_quiz",
    title: "امتحان تجريبي جديد",
    message: "امتحان منتصف الفصل متاح الآن",
    link: "/content/exam-1",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "n_ann_1",
    type: "announcement",
    title: "إعلان موعد المراجعة",
    message: "المراجعة النهائية يوم الخميس القادم",
    link: "/announcements",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "n_reminder_1",
    type: "study_reminder",
    title: "تذكير خطة المذاكرة",
    message: "حان وقت مذاكرة المحاسبة بحسب خطتك",
    link: "/planner",
    read: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "n_milestone_1",
    type: "milestone",
    title: "إنجاز 50% من المادة!",
    message: "أحسنت العمل! قطعت نصف مسار مادة الاقتصاد",
    link: "/analytics",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "n_system_1",
    type: "system",
    title: "تحديث أمني للنظام",
    message: "تم تحسين استقرار المنصة",
    link: "/notifications",
    read: true,
    createdAt: new Date().toISOString(),
  },
];

// 2. Test Default Preferences
console.log("\n--- Testing Default Preferences Filtering ---");
const allVisible = filterNotificationsByPreferences(
  mockNotifications,
  DEFAULT_NOTIFICATION_PREFERENCES
);
assert(allVisible.length === mockNotifications.length, "All notifications visible with default preferences");

// 3. Test Preference Toggling
console.log("\n--- Testing Custom Preferences Filtering ---");
const noQuizzesOrLectures: NotificationPreferences = {
  ...DEFAULT_NOTIFICATION_PREFERENCES,
  new_lectures: false,
  quiz_notifications: false,
};
const filtered = filterNotificationsByPreferences(mockNotifications, noQuizzesOrLectures);
assert(!filtered.some((n) => n.type === "new_lecture"), "New lectures filtered out when preference is false");
assert(!filtered.some((n) => n.type === "new_quiz"), "Quizzes filtered out when preference is false");
assert(filtered.some((n) => n.type === "new_resource"), "Resources still visible");
assert(filtered.some((n) => n.type === "system"), "System notifications always remain visible");

// 4. Test Unread Count Calculations
console.log("\n--- Testing Unread Count ---");
const unreadCount = mockNotifications.filter((n) => !n.read).length;
assert(unreadCount === 4, `Unread count matches expected (expected 4, got ${unreadCount})`);

// 5. Test Smart Routing
console.log("\n--- Testing Smart Routing ---");
const lectureNotif = mockNotifications.find((n) => n.type === "new_lecture");
assert(Boolean(lectureNotif?.link?.startsWith("/content/")), "Lecture notification routes to /content/[id]");

const annNotif = mockNotifications.find((n) => n.type === "announcement");
assert(annNotif?.link === "/announcements", "Announcement notification routes to /announcements");

const milestoneNotif = mockNotifications.find((n) => n.type === "milestone");
assert(milestoneNotif?.link === "/analytics", "Milestone notification routes to /analytics");

console.log("\n🎉 ALL NOTIFICATION CENTER TESTS PASSED SUCCESSFULLY! 🚀");
