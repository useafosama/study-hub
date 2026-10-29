export interface VideoProgress {
  contentId: string;
  videoId?: string;
  currentTime: number; // in seconds
  duration: number; // in seconds
  progressPercent: number; // 0 to 100
  lastWatchedAt: number;
  completed: boolean;
}

const STORAGE_PREFIX = "studyhub_video_progress_";

export function getVideoProgress(contentId: string): VideoProgress | null {
  if (typeof window === "undefined" || !contentId) return null;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + contentId);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveVideoProgress(
  contentId: string,
  data: { currentTime: number; duration: number; videoId?: string }
): void {
  if (typeof window === "undefined" || !contentId || data.duration <= 0) return;
  try {
    const safeCurrent = Math.max(0, Math.floor(data.currentTime));
    const safeDuration = Math.max(1, Math.floor(data.duration));
    const progressPercent = Math.min(100, Math.round((safeCurrent / safeDuration) * 100));

    const progress: VideoProgress = {
      contentId,
      videoId: data.videoId,
      currentTime: safeCurrent,
      duration: safeDuration,
      progressPercent,
      lastWatchedAt: Date.now(),
      completed: progressPercent >= 85, // threshold for completion
    };

    localStorage.setItem(STORAGE_PREFIX + contentId, JSON.stringify(progress));
  } catch (err) {
    console.debug("Failed to save video progress:", err);
  }
}

export function clearVideoProgress(contentId: string): void {
  if (typeof window === "undefined" || !contentId) return;
  try {
    localStorage.removeItem(STORAGE_PREFIX + contentId);
  } catch {}
}

export function formatTimestamp(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
