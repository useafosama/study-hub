import { extractYouTubeVideoId, getYouTubeEmbedUrl, getYouTubeWatchUrl, isValidHttpUrl } from "../lib/youtube/utils";
import { usernameToInternalEmail, internalEmailToUsername, isValidUsername } from "../lib/auth/utils";
import { CreateUserSchema, SubjectSchema, ContentSchema, ResourceSchema, AnnouncementSchema, LoginSchema } from "../lib/validation/schemas";

console.log("=== Testing YouTube Utilities ===");
const testUrls = [
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "https://youtu.be/dQw4w9WgXcQ",
  "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "https://www.youtube.com/shorts/dQw4w9WgXcQ",
  "https://m.youtube.com/watch?v=dQw4w9WgXcQ&feature=shared",
  "dQw4w9WgXcQ",
];

for (const u of testUrls) {
  const id = extractYouTubeVideoId(u);
  if (id !== "dQw4w9WgXcQ") {
    throw new Error(`Failed to extract ID from ${u}`);
  }
}
console.log("✓ All YouTube URLs parsed correctly");

console.log("\n=== Testing Auth Email & Username Mapping ===");
const testCases = [
  { input: "admin", expected: "admin@studyhub.internal" },
  { input: "khaled", expected: "khaled@studyhub.internal" },
  { input: "salama", expected: "salama@studyhub.internal" },
  { input: "admin@studyhub.internal", expected: "admin@studyhub.internal" },
  { input: "Khaled", expected: "khaled@studyhub.internal" },
  { input: "ADMIN@STUDYHUB.INTERNAL", expected: "admin@studyhub.internal" },
  { input: "salama@studyhub.internal", expected: "salama@studyhub.internal" },
  { input: "user@example.com", expected: "user@example.com" },
];

for (const tc of testCases) {
  const result = usernameToInternalEmail(tc.input);
  console.log(`Input: "${tc.input}" -> Email: "${result}"`);
  if (result !== tc.expected) {
    throw new Error(`Expected "${tc.expected}" but got "${result}" for input "${tc.input}"`);
  }
}
console.log("✓ All username-to-email conversions passed!");

console.log("\n=== Testing LoginSchema ===");
const loginTests = [
  { username: "admin", password: "password123", valid: true },
  { username: "khaled", password: "password123", valid: true },
  { username: "salama", password: "password123", valid: true },
  { username: "admin@studyhub.internal", password: "password123", valid: true },
  { username: "ab", password: "password123", valid: false }, // too short
  { username: "admin", password: "123", valid: false }, // too short password
];

for (const lt of loginTests) {
  const parsed = LoginSchema.safeParse({ username: lt.username, password: lt.password });
  if (parsed.success !== lt.valid) {
    throw new Error(`LoginSchema failed for ${JSON.stringify(lt)}`);
  }
}
console.log("✓ LoginSchema validation tests passed!");

console.log("\n ALL TESTS PASSED SUCCESSFULLY! 🚀");
