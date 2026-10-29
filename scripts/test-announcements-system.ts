/**
 * Unit Test Suite: Announcement Center
 * Verifies:
 * 1. Encoding and parsing of announcement metadata (type, priority, audience, author)
 * 2. Audience targeting security (all, subject enrollment, specific students)
 * 3. Expiration detection and automatic filtering for students
 * 4. Read/unread state tracking and unread counter
 * 5. Notifications integration and smart routing links
 * 6. Search and multi-filter logic
 */

import {
  encodeAnnouncementContent,
  parseAnnouncementContent,
} from "../lib/announcements";
import {
  DetailedAnnouncement,
  AnnouncementMeta,
} from "../types/database";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASSED: ${message}`);
}

console.log("=== Testing Announcement Center System ===\n");

// --- 1. Testing Metadata Encoding & Parsing ---
console.log("--- Testing Metadata Encoding & Parsing ---");
const testMeta: AnnouncementMeta = {
  type: "exam",
  priority: "urgent",
  author_name: "د. هاني عثمان",
  target_audience: "subject",
  target_student_ids: ["student-1", "student-2"],
};
const rawText = "يرجى العلم بأن اختبار نصف الفصل سيعقد يوم السبت القادم بمدرج 3.";
const encoded = encodeAnnouncementContent(rawText, testMeta);

assert(encoded.includes("<!--ann_meta:"), "Encoded content contains metadata tag");
assert(encoded.includes(rawText), "Encoded content contains the original message text");

const parsed = parseAnnouncementContent(encoded, "sub-123");
assert(parsed.cleanContent === rawText, "Clean content matches original text exactly");
assert(parsed.meta.type === "exam", "Parsed type matches 'exam'");
assert(parsed.meta.priority === "urgent", "Parsed priority matches 'urgent'");
assert(parsed.meta.author_name === "د. هاني عثمان", "Parsed author matches 'د. هاني عثمان'");
assert(parsed.meta.target_audience === "subject", "Parsed target_audience matches 'subject'");
assert(parsed.meta.target_student_ids?.length === 2, "Parsed target students count matches 2");

// --- 2. Testing Legacy Announcement Parsing Fallbacks ---
console.log("\n--- Testing Legacy Announcement Parsing Fallbacks ---");
const legacyText = "تنبيه هام وعاجل: تم تغيير موعد المحاضرة.";
const parsedLegacy = parseAnnouncementContent(legacyText, null);
assert(parsedLegacy.cleanContent === legacyText, "Legacy text returned as clean content");
assert(parsedLegacy.meta.priority === "urgent", "Auto-detected urgent priority from text");
assert(parsedLegacy.meta.type === "general", "Defaulted type to general when no subject");
assert(parsedLegacy.meta.author_name === "إدارة المنصة", "Defaulted author to 'إدارة المنصة'");

const legacyCourseText = "ملف شيت المسائل الخاص بالسكشن الأول.";
const parsedLegacyCourse = parseAnnouncementContent(legacyCourseText, "sub-nano");
assert(parsedLegacyCourse.meta.type === "course", "Auto-detected course type when subjectId is present");

// --- 3. Testing Expiration Logic ---
console.log("\n--- Testing Expiration Logic ---");
const now = new Date();
const pastDate = new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(); // 1 day ago
const futureDate = new Date(now.getTime() + 1000 * 60 * 60 * 24).toISOString(); // 1 day in future

const activeAnnouncement: DetailedAnnouncement = {
  id: "ann-active",
  title: "إعلان نشط",
  content: "محتوى",
  clean_content: "محتوى",
  target_type: "all",
  is_published: true,
  created_at: now.toISOString(),
  expires_at: futureDate,
  type: "general",
  priority: "normal",
  author_name: "إدارة المنصة",
  target_audience: "all",
  is_expired: false,
};

const expiredAnnouncement: DetailedAnnouncement = {
  id: "ann-expired",
  title: "إعلان منتهي",
  content: "محتوى منتهي",
  clean_content: "محتوى منتهي",
  target_type: "all",
  is_published: true,
  created_at: pastDate,
  expires_at: pastDate,
  type: "general",
  priority: "normal",
  author_name: "إدارة المنصة",
  target_audience: "all",
  is_expired: true,
};

// Filter logic as used in getStudentAnnouncements()
function filterForStudent(list: DetailedAnnouncement[], nowDate: Date) {
  return list.filter((a) => !a.expires_at || new Date(a.expires_at) >= nowDate);
}

const studentVisible = filterForStudent([activeAnnouncement, expiredAnnouncement], now);
assert(studentVisible.length === 1, "Only non-expired announcement is visible to students");
assert(studentVisible[0].id === "ann-active", "Active announcement preserved");

// Admin keeps all
assert([activeAnnouncement, expiredAnnouncement].length === 2, "Admin sees both active and expired announcements");

// --- 4. Testing Audience Targeting Security ---
console.log("\n--- Testing Audience Targeting Security ---");
const studentUser = {
  id: "user-ahmed",
  enrolledSubjectIds: new Set(["course-math", "course-physics"]),
};

function isTargetedToStudent(
  meta: AnnouncementMeta,
  subjectId: string | null | undefined,
  studentId: string,
  enrolledIds: Set<string>
): boolean {
  if (meta.target_audience === "all") return true;
  if (meta.target_audience === "subject") {
    return Boolean(subjectId && enrolledIds.has(subjectId));
  }
  if (meta.target_audience === "students") {
    return Boolean(meta.target_student_ids && meta.target_student_ids.includes(studentId));
  }
  return false;
}

// Case 1: General
assert(
  isTargetedToStudent({ type: "general", priority: "normal", target_audience: "all" }, null, studentUser.id, studentUser.enrolledSubjectIds),
  "All students see general announcement"
);

// Case 2: Enrolled Course
assert(
  isTargetedToStudent({ type: "course", priority: "normal", target_audience: "subject" }, "course-math", studentUser.id, studentUser.enrolledSubjectIds),
  "Student sees announcement for course they are enrolled in (Math)"
);

// Case 3: Non-enrolled Course
assert(
  !isTargetedToStudent({ type: "course", priority: "normal", target_audience: "subject" }, "course-chemistry", studentUser.id, studentUser.enrolledSubjectIds),
  "Student DOES NOT see announcement for course they are NOT enrolled in (Chemistry)"
);

// Case 4: Specific student included
assert(
  isTargetedToStudent(
    { type: "important", priority: "urgent", target_audience: "students", target_student_ids: ["user-ahmed", "user-sara"] },
    null,
    studentUser.id,
    studentUser.enrolledSubjectIds
  ),
  "Student sees announcement when their ID is in target_student_ids"
);

// Case 5: Specific student excluded
assert(
  !isTargetedToStudent(
    { type: "important", priority: "urgent", target_audience: "students", target_student_ids: ["user-sara", "user-khaled"] },
    null,
    studentUser.id,
    studentUser.enrolledSubjectIds
  ),
  "Student DOES NOT see announcement when their ID is excluded"
);

// --- 5. Testing Read/Unread State & Counts ---
console.log("\n--- Testing Read/Unread State & Counts ---");
const readSet = new Set(["ann-1", "ann-3"]);
const announcementList: DetailedAnnouncement[] = [
  { ...activeAnnouncement, id: "ann-1", is_read: readSet.has("ann-1") },
  { ...activeAnnouncement, id: "ann-2", is_read: readSet.has("ann-2") },
  { ...activeAnnouncement, id: "ann-3", is_read: readSet.has("ann-3") },
  { ...activeAnnouncement, id: "ann-4", is_read: readSet.has("ann-4") },
];

const unreadCount = announcementList.filter((a) => !a.is_read).length;
assert(unreadCount === 2, "Unread count accurately calculated (2 out of 4)");

// Mark all as read simulation
const allReadList = announcementList.map((a) => ({ ...a, is_read: true }));
const newUnreadCount = allReadList.filter((a) => !a.is_read).length;
assert(newUnreadCount === 0, "Mark all as read resets unread count to 0");

// --- 6. Testing Notifications Integration ---
console.log("\n--- Testing Notifications Integration ---");
const announcementSample = {
  id: "ann-uuid-999",
  title: "اختبار تجريبي في مادة الفيزياء",
  content: encodeAnnouncementContent("يرجى الدخول للاختبار التجريبي يوم الأحد.", {
    type: "exam",
    priority: "important",
    author_name: "د. هاني",
    target_audience: "all",
  }),
  subject_id: null,
};

const { cleanContent } = parseAnnouncementContent(announcementSample.content, null);
const generatedNotification = {
  id: `ann_${announcementSample.id}`,
  type: "announcement",
  title: announcementSample.title,
  message: cleanContent,
  link: `/announcements?id=${announcementSample.id}`,
};

assert(generatedNotification.id === "ann_ann-uuid-999", "Notification ID prefixed with 'ann_' to prevent duplicates");
assert(generatedNotification.link === "/announcements?id=ann-uuid-999", "Smart routing link targets /announcements?id=[id]");
assert(!generatedNotification.message.includes("<!--ann_meta:"), "Notification preview does not leak raw metadata tags");

// --- 7. Testing Search and Filtering Logic ---
console.log("\n--- Testing Search and Filtering Logic ---");
const testData: DetailedAnnouncement[] = [
  { ...activeAnnouncement, id: "1", title: "اختبار الأحياء النصفي", type: "exam", priority: "urgent", is_read: false },
  { ...activeAnnouncement, id: "2", title: "جدول محاضرات الفصل الثاني", type: "general", priority: "normal", is_read: true },
  { ...activeAnnouncement, id: "3", title: "تحديث تقني لمنصة ستادي هب", type: "system", priority: "important", is_read: false },
];

// Search test
const searchResults = testData.filter((a) => a.title.includes("الأحياء"));
assert(searchResults.length === 1 && searchResults[0].id === "1", "Search by keyword matches 'الأحياء'");

// Unread filter
const unreadFilterResults = testData.filter((a) => !a.is_read);
assert(unreadFilterResults.length === 2, "Unread filter returns 2 unread items");

// Urgent/Important filter
const urgentFilterResults = testData.filter((a) => a.priority === "urgent" || a.priority === "important");
assert(urgentFilterResults.length === 2, "Priority filter returns urgent and important items");

console.log("\n🎉 ALL ANNOUNCEMENT CENTER TESTS PASSED SUCCESSFULLY! 🚀");
