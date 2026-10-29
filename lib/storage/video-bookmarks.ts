export interface VideoBookmark {
  id: string;
  contentId: string;
  timestamp: number; // in seconds
  title: string;
  createdAt: number;
}

const STORAGE_PREFIX = "studyhub_video_bookmarks_";

export function getVideoBookmarks(contentId: string): VideoBookmark[] {
  if (typeof window === "undefined" || !contentId) return [];
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + contentId);
    if (!raw) return [];
    const list: VideoBookmark[] = JSON.parse(raw);
    return Array.isArray(list) ? list.sort((a, b) => a.timestamp - b.timestamp) : [];
  } catch {
    return [];
  }
}

export function addVideoBookmark(
  contentId: string,
  timestamp: number,
  title?: string
): VideoBookmark {
  const bookmarks = getVideoBookmarks(contentId);
  const safeTimestamp = Math.max(0, Math.floor(timestamp));
  const newBookmark: VideoBookmark = {
    id: "bm_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    contentId,
    timestamp: safeTimestamp,
    title: title?.trim() || `علامة زمنية عند ${safeTimestamp} ثانية`,
    createdAt: Date.now(),
  };

  const updated = [...bookmarks, newBookmark].sort((a, b) => a.timestamp - b.timestamp);
  try {
    localStorage.setItem(STORAGE_PREFIX + contentId, JSON.stringify(updated));
  } catch (err) {
    console.debug("Failed to add video bookmark:", err);
  }
  return newBookmark;
}

export function deleteVideoBookmark(contentId: string, bookmarkId: string): void {
  const bookmarks = getVideoBookmarks(contentId).filter((b) => b.id !== bookmarkId);
  try {
    localStorage.setItem(STORAGE_PREFIX + contentId, JSON.stringify(bookmarks));
  } catch {}
}
