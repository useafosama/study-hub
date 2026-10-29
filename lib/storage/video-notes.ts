export interface TimestampNote {
  id: string;
  contentId: string;
  timestamp: number; // in seconds
  text: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_PREFIX = "studyhub_video_timestamp_notes_";

export function getTimestampNotes(contentId: string): TimestampNote[] {
  if (typeof window === "undefined" || !contentId) return [];
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + contentId);
    if (!raw) return [];
    const list: TimestampNote[] = JSON.parse(raw);
    return Array.isArray(list) ? list.sort((a, b) => a.timestamp - b.timestamp) : [];
  } catch {
    return [];
  }
}

export function addTimestampNote(
  contentId: string,
  timestamp: number,
  text: string
): TimestampNote {
  const notes = getTimestampNotes(contentId);
  const now = Date.now();
  const newNote: TimestampNote = {
    id: "tnote_" + now + "_" + Math.random().toString(36).substring(2, 6),
    contentId,
    timestamp: Math.max(0, Math.floor(timestamp)),
    text: text.trim(),
    createdAt: now,
    updatedAt: now,
  };

  const updated = [...notes, newNote].sort((a, b) => a.timestamp - b.timestamp);
  try {
    localStorage.setItem(STORAGE_PREFIX + contentId, JSON.stringify(updated));
  } catch (err) {
    console.debug("Failed to add timestamp note:", err);
  }
  return newNote;
}

export function updateTimestampNote(
  contentId: string,
  noteId: string,
  text: string
): void {
  const notes = getTimestampNotes(contentId);
  const target = notes.find((n) => n.id === noteId);
  if (target) {
    target.text = text.trim();
    target.updatedAt = Date.now();
    try {
      localStorage.setItem(STORAGE_PREFIX + contentId, JSON.stringify(notes));
    } catch {}
  }
}

export function deleteTimestampNote(contentId: string, noteId: string): void {
  const notes = getTimestampNotes(contentId).filter((n) => n.id !== noteId);
  try {
    localStorage.setItem(STORAGE_PREFIX + contentId, JSON.stringify(notes));
  } catch {}
}
