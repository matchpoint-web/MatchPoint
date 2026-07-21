import type { Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export type CoachNoteRow = Tables<"coach_notes">;

export const COACH_NOTES_PER_PAGE = 50;

const COACH_NOTE_SELECT =
  "id, college_id, player_id, status, notes, created_at, updated_at" as const;

export type CoachNotesPageQueryInput = {
  collegeId: string;
  page?: number;
  pageSize?: number;
};

export type CoachNotesPageQueryResult = {
  rows: CoachNoteRow[];
  totalCount: number;
  page: number;
  pageSize: number;
};

function normalizePage(page: number | undefined): number {
  return Math.max(1, Math.floor(page ?? 1) || 1);
}

function normalizePageSize(
  pageSize: number | undefined,
  fallback: number,
): number {
  return pageSize && pageSize > 0 ? Math.floor(pageSize) : fallback;
}

/** Single note for a college + player pair. */
export async function queryCoachNoteByPair(
  collegeId: string,
  playerId: string,
): Promise<CoachNoteRow | null> {
  if (!collegeId || !playerId) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coach_notes")
    .select(COACH_NOTE_SELECT)
    .eq("college_id", collegeId)
    .eq("player_id", playerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as CoachNoteRow | null) ?? null;
}

/** All notes for a college (newest first). */
export async function queryCoachNotesForCollege(
  collegeId: string,
): Promise<CoachNoteRow[]> {
  if (!collegeId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coach_notes")
    .select(COACH_NOTE_SELECT)
    .eq("college_id", collegeId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as CoachNoteRow[] | null) ?? [];
}

/** Paginated notes for a college (newest first). */
export async function queryCoachNotesPage(
  input: CoachNotesPageQueryInput,
): Promise<CoachNotesPageQueryResult> {
  const pageSize = normalizePageSize(input.pageSize, COACH_NOTES_PER_PAGE);
  const page = normalizePage(input.page);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from("coach_notes")
    .select(COACH_NOTE_SELECT, { count: "exact" })
    .eq("college_id", input.collegeId)
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    rows: (data as CoachNoteRow[] | null) ?? [],
    totalCount: count ?? 0,
    page,
    pageSize,
  };
}

/**
 * Status map for the given player ids (messaging / list enrichment).
 */
export async function queryCoachNoteStatuses(
  collegeId: string,
  playerIds: string[],
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (!collegeId || playerIds.length === 0) return result;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coach_notes")
    .select("player_id, status")
    .eq("college_id", collegeId)
    .in("player_id", playerIds);

  if (error) {
    throw new Error(error.message);
  }

  for (const row of data ?? []) {
    if (row.player_id && typeof row.status === "string") {
      result.set(row.player_id, row.status);
    }
  }

  return result;
}

export async function insertCoachNote(input: {
  collegeId: string;
  playerId: string;
  status: string;
  notes: string;
  updatedAt: string;
}): Promise<CoachNoteRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coach_notes")
    .insert({
      college_id: input.collegeId,
      player_id: input.playerId,
      status: input.status,
      notes: input.notes,
      updated_at: input.updatedAt,
    })
    .select(COACH_NOTE_SELECT)
    .single();

  if (error) {
    // Unique (college_id, player_id) race — fall through to update path in service.
    if (error.code === "23505") {
      const existing = await queryCoachNoteByPair(
        input.collegeId,
        input.playerId,
      );
      if (existing) {
        return updateCoachNote({
          collegeId: input.collegeId,
          playerId: input.playerId,
          status: input.status,
          notes: input.notes,
          updatedAt: input.updatedAt,
        });
      }
    }
    throw new Error(error.message);
  }

  return data as CoachNoteRow;
}

export async function updateCoachNote(input: {
  collegeId: string;
  playerId: string;
  status: string;
  notes: string;
  updatedAt: string;
}): Promise<CoachNoteRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coach_notes")
    .update({
      status: input.status,
      notes: input.notes,
      updated_at: input.updatedAt,
    })
    .eq("college_id", input.collegeId)
    .eq("player_id", input.playerId)
    .select(COACH_NOTE_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CoachNoteRow;
}

export async function deleteCoachNoteRow(
  collegeId: string,
  playerId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("coach_notes")
    .delete()
    .eq("college_id", collegeId)
    .eq("player_id", playerId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function countCoachNotesForCollegeByStatus(
  collegeId: string,
  status: string,
): Promise<number> {
  if (!collegeId) return 0;

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("coach_notes")
    .select("id", { count: "exact", head: true })
    .eq("college_id", collegeId)
    .eq("status", status);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}
