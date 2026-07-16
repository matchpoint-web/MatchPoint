export const COACH_NOTES_STORAGE_KEY = "coach_notes";

export const coachNoteStatuses = [
  "Prospect",
  "Recruiting",
  "Interested",
  "Follow Up",
  "Offered",
  "Signed",
] as const;

export type CoachNoteStatus = (typeof coachNoteStatuses)[number];

export type CoachNote = {
  playerId: string;
  status: CoachNoteStatus;
  notes: string;
  updatedAt: string;
};

type CoachNotesStore = Record<string, CoachNote>;

function isCoachNoteStatus(value: unknown): value is CoachNoteStatus {
  return (
    typeof value === "string" &&
    (coachNoteStatuses as readonly string[]).includes(value)
  );
}

function isCoachNote(value: unknown): value is CoachNote {
  if (!value || typeof value !== "object") return false;
  const note = value as Record<string, unknown>;
  return (
    typeof note.playerId === "string" &&
    isCoachNoteStatus(note.status) &&
    typeof note.notes === "string" &&
    (typeof note.updatedAt === "string" || note.updatedAt === undefined)
  );
}

function normalizeCoachNote(value: CoachNote): CoachNote {
  return {
    playerId: value.playerId,
    status: value.status,
    notes: value.notes,
    updatedAt:
      typeof value.updatedAt === "string" && value.updatedAt
        ? value.updatedAt
        : new Date(0).toISOString(),
  };
}

function readStore(): CoachNotesStore {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(COACH_NOTES_STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const store: CoachNotesStore = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (isCoachNote(value)) {
        store[key] = normalizeCoachNote(value);
      }
    }
    return store;
  } catch {
    return {};
  }
}

function writeStore(store: CoachNotesStore): void {
  localStorage.setItem(COACH_NOTES_STORAGE_KEY, JSON.stringify(store));
}

export function getCoachNotes(playerId: string): CoachNote | null {
  const store = readStore();
  return store[playerId] ?? null;
}

export function getAllCoachNotes(): CoachNote[] {
  return Object.values(readStore());
}

export function countCoachNotesByStatus(status: CoachNoteStatus): number {
  return getAllCoachNotes().filter((note) => note.status === status).length;
}

export function getRecentCoachNotes(limit = 5): CoachNote[] {
  return [...getAllCoachNotes()]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, limit);
}

export function saveCoachNotes(
  playerId: string,
  status: CoachNoteStatus,
  notes: string,
): CoachNote {
  const entry: CoachNote = {
    playerId,
    status,
    notes,
    updatedAt: new Date().toISOString(),
  };

  const store = readStore();
  store[playerId] = entry;
  writeStore(store);
  return entry;
}
