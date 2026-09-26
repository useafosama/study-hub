/**
 * YouTube Utility functions for extracting video IDs and building embed / watch links.
 */

export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== "string") return null;

  const trimmed = url.trim();

  // Pattern matching standard formats:
  // 1. https://www.youtube.com/watch?v=VIDEO_ID
  // 2. https://youtu.be/VIDEO_ID
  // 3. https://www.youtube.com/embed/VIDEO_ID
  // 4. https://www.youtube.com/shorts/VIDEO_ID
  // 5. https://m.youtube.com/watch?v=VIDEO_ID

  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);

  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }

  // If user just typed the 11 character ID directly
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function getYouTubeEmbedUrl(videoIdOrUrl: string): string | null {
  const videoId = extractYouTubeVideoId(videoIdOrUrl);
  if (!videoId) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`;
}

export function getYouTubeWatchUrl(videoIdOrUrl: string): string | null {
  const videoId = extractYouTubeVideoId(videoIdOrUrl);
  if (!videoId) return null;
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function getYouTubeThumbnailUrl(videoIdOrUrl: string, quality: "hq" | "mq" | "maxres" = "hq"): string | null {
  const videoId = extractYouTubeVideoId(videoIdOrUrl);
  if (!videoId) return null;
  if (quality === "maxres") {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
}

export function isValidHttpUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

export function isSecureHttpsUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === "https:";
  } catch (_) {
    return false;
  }
}
