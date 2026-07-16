export const COACH_NOTES_STORAGE_KEY = "coach_notes";

export const coachNoteStatuses = [
  "Prospect",
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
    typeof note.notes === "string"
  );
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
        store[key] = value;
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

export function saveCoachNotes(
  playerId: string,
  status: CoachNoteStatus,
  notes: string,
): CoachNote {
  const entry: CoachNote = {
    playerId,
    status,
    notes,
  };

  const store = readStore();
  store[playerId] = entry;
  writeStore(store);
  return entry;
}
