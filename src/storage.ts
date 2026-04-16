import type { Note } from "./types";

const STORAGE_KEY = "memo-app-typescript-notes";

export function loadNotes(): Note[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isNote);
  } catch {
    return [];
  }
}

export function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function isNote(value: unknown): value is Note {
  if (typeof value !== "object" || value === null) return false;

  const note = value as Record<string, unknown>;

  return (
    typeof note.id === "string" &&
    typeof note.title === "string" &&
    typeof note.content === "string" &&
    typeof note.createdAt === "string" &&
    typeof note.updatedAt === "string" &&
    typeof note.isPinned === "boolean" &&
    Array.isArray(note.tags) &&
    note.tags.every((tag) => typeof tag === "string")
  );
}
