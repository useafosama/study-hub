import {
  calculateStudyPatterns,
  getWeeklyMultiWeekTrend,
  getMonthlyStudyTrend,
  mergeStudySessions,
  formatDurationArabic,
  StudySessionRecord,
} from "../lib/storage/timer";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("=== Testing Student Learning Analytics Engine ===");

// 1. Test Empty State & Zero Data
console.log("\n--- Testing Empty State (No sessions / zero data) ---");
const emptyPatterns = calculateStudyPatterns([]);
assert(emptyPatterns.hasEnoughData === false, "Empty sessions report hasEnoughData = false");
assert(emptyPatterns.totalSessions === 0, "Total sessions is 0");
assert(emptyPatterns.mostActivePeriod === null, "mostActivePeriod is null on empty data");

const singleSessionPatterns = calculateStudyPatterns([
  {
    id: "s1",
    userId: "u1",
    courseId: "c1",
    courseName: "Accounting",
    courseCode: "ACC101",
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    duration: 1800,
    targetDuration: 1800,
    completionStatus: "completed",
    createdAt: Date.now(),
  },
]);
assert(singleSessionPatterns.hasEnoughData === false, "Single session reports hasEnoughData = false (requires >= 2)");
assert(singleSessionPatterns.totalSessions === 1, "Single session count is 1");

// 2. Test Multi-Week and Monthly Trends on Empty Data
const emptyWeeks = getWeeklyMultiWeekTrend([]);
assert(emptyWeeks.length === 4, "Returns 4 weeks");
assert(emptyWeeks.every((w) => w.seconds === 0), "All empty weeks have 0 seconds");

const emptyMonths = getMonthlyStudyTrend([]);
assert(emptyMonths.length === 6, "Returns 6 months");
assert(emptyMonths.every((m) => m.seconds === 0), "All empty months have 0 seconds");

// 3. Test Student with Large Amounts of Data & Pattern Recognition
console.log("\n--- Testing Rich Data & Pattern Recognition ---");
const now = new Date();
const mockSessions: StudySessionRecord[] = [];

// Create 15 sessions in evening hours (e.g. 19:00 = 7 PM) primarily on Mondays (day 1)
for (let i = 0; i < 15; i++) {
  const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
  d.setHours(19, 30, 0, 0); // 7:30 PM (Evening period)

  mockSessions.push({
    id: `session_${i}`,
    userId: "user_test",
    courseId: i % 2 === 0 ? "course_accounting" : "course_economics",
    courseName: i % 2 === 0 ? "محاسبة مالية" : "اقتصاد كلي",
    courseCode: i % 2 === 0 ? "ACC" : "ECO",
    startTime: d.toISOString(),
    endTime: new Date(d.getTime() + 2400 * 1000).toISOString(),
    duration: 2400, // 40 minutes each
    targetDuration: 2400,
    completionStatus: "completed",
    createdAt: d.getTime(),
  });
}

const richPatterns = calculateStudyPatterns(mockSessions);
assert(richPatterns.hasEnoughData === true, "Rich sessions report hasEnoughData = true");
assert(richPatterns.totalSessions === 15, "Total sessions count is 15");
assert(richPatterns.averageSessionDurationSeconds === 2400, "Average duration is 2400 seconds (40 mins)");
assert(Boolean(richPatterns.mostActivePeriod?.includes("المسائية")), "Peak period detected as Evening");

// 4. Test Session Merging (Deduplication)
console.log("\n--- Testing Session Deduplication & Merging ---");
const localS = [
  {
    id: "dup_1",
    userId: "u1",
    courseId: "c1",
    courseName: "Local Course",
    courseCode: "C1",
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    duration: 1500,
    targetDuration: 1500,
    completionStatus: "completed" as const,
    createdAt: Date.now(),
  },
];

const serverS = [
  {
    id: "dup_1", // same ID
    courseId: "c1",
    courseName: "Server Course",
    courseCode: "C1",
    duration: 1500,
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    completionStatus: "completed",
  },
  {
    id: "unique_server_2",
    courseId: "c2",
    courseName: "Marketing",
    courseCode: "MKT",
    duration: 2000,
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    completionStatus: "completed",
  },
];

const merged = mergeStudySessions(localS, serverS);
assert(merged.length === 2, "Duplicate session ID was deduplicated correctly (length is 2)");
assert(merged.some((s) => s.id === "unique_server_2"), "Server session added");

// 5. Test Duration Formatting
console.log("\n--- Testing Duration Formatting ---");
assert(formatDurationArabic(0) === "0 ثانية", "0 formatted as 0 ثانية");
assert(formatDurationArabic(3600 * 3 + 1200) === "3 س و 20 د", "3h 20m formatted as 3 س و 20 د");

console.log("\n🎉 ALL ANALYTICS ENGINE TESTS PASSED SUCCESSFULLY! 🚀");
