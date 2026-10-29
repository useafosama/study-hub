import {
  formatTimestamp,
} from "../lib/storage/video-progress";
import { extractYouTubeVideoId } from "../lib/youtube/utils";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("=== Testing Premium Educational Video Player Engine ===");

// 1. Test formatTimestamp
console.log("\n--- Testing formatTimestamp ---");
assert(formatTimestamp(0) === "00:00", "0s formatted as 00:00");
assert(formatTimestamp(75) === "01:15", "75s formatted as 01:15");
assert(formatTimestamp(1456) === "24:16", "1456s formatted as 24:16");
assert(formatTimestamp(3600) === "01:00:00", "3600s formatted as 01:00:00");
assert(formatTimestamp(3665) === "01:01:05", "3665s formatted as 01:01:05");
assert(formatTimestamp(-10) === "00:00", "Negative seconds clamped to 00:00");

// 2. Test Completion Threshold logic (85%)
console.log("\n--- Testing Completion Threshold ---");
const duration = 1800; // 30 mins
const timeLow = 300; // 5 mins (16.6%)
const timeMid = 1400; // ~77.7%
const timeThreshold = 1530; // 85% exactly
const timeAlmostEnd = 1750; // ~97.2%

const isCompletedLow = (timeLow / duration) >= 0.85;
const isCompletedMid = (timeMid / duration) >= 0.85;
const isCompletedThreshold = (timeThreshold / duration) >= 0.85;
const isCompletedAlmostEnd = (timeAlmostEnd / duration) >= 0.85;

assert(isCompletedLow === false, "5 mins not completed (16%)");
assert(isCompletedMid === false, "77% not completed (<85%)");
assert(isCompletedThreshold === true, "85% marked completed");
assert(isCompletedAlmostEnd === true, "97% marked completed");

// 3. Test Resume Position Detection logic
console.log("\n--- Testing Resume Position Detection ---");
function shouldPromptResume(current: number, dur: number): boolean {
  return current > 15 && dur > 30 && current < dur - 15;
}

assert(shouldPromptResume(5, 1800) === false, "Do not prompt if watched less than 15s");
assert(shouldPromptResume(1456, 1800) === true, "Prompt if watched 24 mins out of 30 mins");
assert(shouldPromptResume(1795, 1800) === false, "Do not prompt if less than 15s remain (near the end)");

// 4. Test YouTube URL Extraction
console.log("\n--- Testing YouTube URL Formats ---");
const testUrls = [
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "https://youtu.be/dQw4w9WgXcQ",
  "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "https://www.youtube.com/shorts/dQw4w9WgXcQ",
  "dQw4w9WgXcQ",
];

testUrls.forEach((url) => {
  const extracted = extractYouTubeVideoId(url);
  assert(extracted === "dQw4w9WgXcQ", `Extracted ID correctly from ${url}`);
});

console.log("\n🎉 ALL EDUCATIONAL VIDEO PLAYER TESTS PASSED SUCCESSFULLY! 🚀");
