import { getCurrentCollegeId } from "@/lib/college-profile-service";
import {
  isCoachNoteStatus,
  type CoachNote,
  type CoachNoteStatus,
} from "@/lib/coach-notes";
import {
  COACH_NOTES_PER_PAGE,
  countCoachNotesForCollegeByStatus,
  deleteCoachNoteRow,
  insertCoachNote,
  queryCoachNoteByPair,
  queryCoachNotesForCollege,
  queryCoachNotesPage,
  updateCoachNote,
  type CoachNoteRow,
} from "@/lib/coach-notes/queries";

export type CoachNotesPageResult = {
  notes: CoachNote[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function mapRowToCoachNote(row: CoachNoteRow): CoachNote {
  return {
    playerId: row.player_id,
    status: isCoachNoteStatus(row.status) ? row.status : "Prospect",
    notes: row.notes ?? "",
    updatedAt: row.updated_at,
  };
}

async function requireCollegeId(): Promise<string> {
  const collegeId = await getCurrentCollegeId();
  if (!collegeId) {
    throw new Error("Not authenticated as a college account.");
  }
  return collegeId;
}

/** Load the current college's note for a player, if any. */
export async function getCoachNote(
  playerId: string,
): Promise<CoachNote | null> {
  if (!playerId) return null;

  const collegeId = await requireCollegeId();
  const row = await queryCoachNoteByPair(collegeId, playerId);
  if (!row) return null;
  return mapRowToCoachNote(row);
}

/**
 * Create or update the current college's note for a player.
 * Private to the owning college (RLS + college_id scope).
 */
export async function saveCoachNote(
  playerId: string,
  status: CoachNoteStatus,
  notes: string,
): Promise<CoachNote> {
  if (!playerId) {
    throw new Error("Player id is required.");
  }
  if (!isCoachNoteStatus(status)) {
    throw new Error("Invalid coach note status.");
  }

  const collegeId = await requireCollegeId();
  const now = new Date().toISOString();

  const existing = await queryCoachNoteByPair(collegeId, playerId);
  const row = existing
    ? await updateCoachNote({
        collegeId,
        playerId,
        status,
        notes,
        updatedAt: now,
      })
    : await insertCoachNote({
        collegeId,
        playerId,
        status,
        notes,
        updatedAt: now,
      });

  return mapRowToCoachNote(row);
}

/** Delete the current college's note for a player. */
export async function deleteCoachNote(playerId: string): Promise<void> {
  if (!playerId) {
    throw new Error("Player id is required.");
  }

  const collegeId = await requireCollegeId();
  await deleteCoachNoteRow(collegeId, playerId);
}

/** All notes for the current college (newest first). */
export async function listCoachNotes(): Promise<CoachNote[]> {
  const collegeId = await getCurrentCollegeId();
  if (!collegeId) return [];

  const rows = await queryCoachNotesForCollege(collegeId);
  return rows.map(mapRowToCoachNote);
}

/** Paginated notes for the current college. */
export async function listCoachNotesPage(params: {
  page?: number;
  pageSize?: number;
} = {}): Promise<CoachNotesPageResult> {
  const collegeId = await getCurrentCollegeId();
  if (!collegeId) {
    return {
      notes: [],
      totalCount: 0,
      page: 1,
      pageSize: params.pageSize ?? COACH_NOTES_PER_PAGE,
      totalPages: 1,
    };
  }

  const pageSize = params.pageSize ?? COACH_NOTES_PER_PAGE;
  const page = params.page ?? 1;
  const { rows, totalCount, page: resolvedPage, pageSize: resolvedSize } =
    await queryCoachNotesPage({
      collegeId,
      page,
      pageSize,
    });

  return {
    notes: rows.map(mapRowToCoachNote),
    totalCount,
    page: resolvedPage,
    pageSize: resolvedSize,
    totalPages: Math.max(1, Math.ceil(totalCount / resolvedSize)),
  };
}

export async function countCoachNotesByStatus(
  status: CoachNoteStatus,
): Promise<number> {
  if (!isCoachNoteStatus(status)) return 0;

  const collegeId = await getCurrentCollegeId();
  if (!collegeId) return 0;

  return countCoachNotesForCollegeByStatus(collegeId, status);
}

export async function getRecentCoachNotes(limit = 5): Promise<CoachNote[]> {
  const notes = await listCoachNotes();
  return notes.slice(0, Math.max(0, limit));
}
