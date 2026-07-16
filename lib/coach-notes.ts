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

export function isCoachNoteStatus(value: unknown): value is CoachNoteStatus {
  return (
    typeof value === "string" &&
    (coachNoteStatuses as readonly string[]).includes(value)
  );
}
