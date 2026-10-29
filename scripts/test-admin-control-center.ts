function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("=== Testing Admin LMS Control Center Logic ===");

// 1. Test Course Completion Statistics Calculation
console.log("\n--- Testing Course Completion Statistics ---");
function calculateCourseProgress(totalContents: number, enrolledStudents: number, totalCompletions: number): number {
  const maxPossible = enrolledStudents * Math.max(1, totalContents);
  return maxPossible > 0 ? Math.min(100, Math.round((totalCompletions / maxPossible) * 100)) : 0;
}

assert(calculateCourseProgress(10, 5, 25) === 50, "Course progress 25/50 is 50%");
assert(calculateCourseProgress(10, 0, 0) === 0, "Empty enrolled students handles gracefully (0%)");
assert(calculateCourseProgress(0, 5, 0) === 0, "Empty contents handles gracefully (0%)");
assert(calculateCourseProgress(5, 2, 10) === 100, "10/10 completions is 100%");

// 2. Test Student Overall Progress Calculation
console.log("\n--- Testing Student Progress Calculations ---");
function calculateStudentProgress(completed: number, total: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

assert(calculateStudentProgress(14, 18) === 78, "14/18 lectures is 78%");
assert(calculateStudentProgress(0, 10) === 0, "0/10 is 0%");
assert(calculateStudentProgress(5, 5) === 100, "5/5 is 100%");

// 3. Test Leaderboard Ranking Logic
console.log("\n--- Testing Leaderboard Ranking ---");
const mockStudents = [
  { id: "s1", name: "Ahmed", completed: 15, studySecs: 3600 },
  { id: "s2", name: "Sarah", completed: 20, studySecs: 1800 },
  { id: "s3", name: "Khaled", completed: 5, studySecs: 7200 },
];

const ranked = [...mockStudents].sort(
  (a, b) => b.completed * 1000 + b.studySecs - (a.completed * 1000 + a.studySecs)
);

assert(ranked[0].name === "Sarah", "Rank 1 is Sarah (20 completed)");
assert(ranked[1].name === "Ahmed", "Rank 2 is Ahmed (15 completed)");
assert(ranked[2].name === "Khaled", "Rank 3 is Khaled (5 completed)");

// 4. Test Search & Filter Matching
console.log("\n--- Testing Search & Filtering Logic ---");
const testUsers = [
  { id: "u1", full_name: "أحمد محمد", username: "ahmed", role: "student", is_active: true, subjects: ["sub1"] },
  { id: "u2", full_name: "سارة علي", username: "sarah", role: "student", is_active: false, subjects: ["sub2"] },
  { id: "u3", full_name: "يوسف أسامة", username: "admin", role: "admin", is_active: true, subjects: [] },
];

function filterUsers(query: string, role: string, status: string, subject: string) {
  const q = query.toLowerCase();
  return testUsers.filter((u) => {
    const matchesSearch = !q || u.full_name.includes(q) || u.username.includes(q);
    const matchesRole = role === "all" || u.role === role;
    const matchesStatus = status === "all" || (status === "active" ? u.is_active : !u.is_active);
    const matchesSub = subject === "all" || u.subjects.includes(subject);
    return matchesSearch && matchesRole && matchesStatus && matchesSub;
  });
}

assert(filterUsers("أحمد", "all", "all", "all").length === 1, "Search by Arabic name works");
assert(filterUsers("", "student", "all", "all").length === 2, "Filter by role student works (2 students)");
assert(filterUsers("", "all", "active", "all").length === 2, "Filter active status works (2 active)");
assert(filterUsers("", "all", "all", "sub1").length === 1, "Filter by course enrollment works");

console.log("\n🎉 ALL ADMIN CONTROL CENTER TESTS PASSED SUCCESSFULLY! 🚀");
