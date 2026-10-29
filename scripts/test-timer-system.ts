import {
  formatTimerDisplay,
  formatDurationArabic,
  TIMER_PRESETS,
} from "../lib/storage/timer";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("=== Testing Study Timer System ===");

// 1. Test formatTimerDisplay
assert(formatTimerDisplay(0) === "00:00", "0 seconds formatted as 00:00");
assert(formatTimerDisplay(25 * 60) === "25:00", "25 mins formatted as 25:00");
assert(formatTimerDisplay(50 * 60) === "50:00", "50 mins formatted as 50:00");
assert(formatTimerDisplay(90 * 60) === "01:30:00", "90 mins formatted as 01:30:00");
assert(formatTimerDisplay(3665) === "01:01:05", "3665 secs formatted as 01:01:05");
assert(formatTimerDisplay(-10) === "00:00", "Negative seconds clamped to 00:00");

// 2. Test formatDurationArabic
assert(formatDurationArabic(45) === "45 ثانية", "45 seconds formatted correctly");
assert(formatDurationArabic(120) === "2 دقيقة", "120 seconds formatted as 2 دقيقة");
assert(formatDurationArabic(3600) === "1 ساعة", "3600 seconds formatted as 1 ساعة");
assert(formatDurationArabic(5400) === "1 س و 30 د", "5400 seconds formatted as 1 س و 30 د");

// 3. Test presets
assert(TIMER_PRESETS.length === 3, "Contains 3 default presets (25, 50, 90)");
assert(TIMER_PRESETS[0].minutes === 25, "Preset 1 is 25m");
assert(TIMER_PRESETS[1].minutes === 50, "Preset 2 is 50m");
assert(TIMER_PRESETS[2].minutes === 90, "Preset 3 is 90m");

console.log("🎉 All timer unit tests passed successfully!");
