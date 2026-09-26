export interface LectureNote {
  id: string;
  contentId: string;
  contentTitle: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  text: string;
  updatedAt: number;
}

const STORAGE_KEY = "studyhub_student_notes";

export function getStoredNotes(): LectureNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getNoteByContentId(contentId: string): LectureNote | null {
  const notes = getStoredNotes();
  return notes.find((n) => n.contentId === contentId) || null;
}

export function saveLectureNote(note: Omit<LectureNote, "id" | "updatedAt">): LectureNote {
  const notes = getStoredNotes();
  const existingIndex = notes.findIndex((n) => n.contentId === note.contentId);
  const now = Date.now();

  if (existingIndex > -1) {
    const updated: LectureNote = {
      ...notes[existingIndex],
      ...note,
      updatedAt: now,
    };
    notes[existingIndex] = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {}
    return updated;
  } else {
    const newNote: LectureNote = {
      ...note,
      id: "note_" + now + "_" + Math.random().toString(36).substring(2, 7),
      updatedAt: now,
    };
    notes.unshift(newNote);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {}
    return newNote;
  }
}

export function deleteLectureNote(contentId: string): void {
  const notes = getStoredNotes().filter((n) => n.contentId !== contentId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {}
}
