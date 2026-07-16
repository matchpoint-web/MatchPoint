import { createClient } from "@/lib/supabase/server";
import { getCurrentCollegeId } from "@/lib/college-profile-service";
import {
  isCoachNoteStatus,
  type CoachNote,
  type CoachNoteStatus,
} from "@/lib/coach-notes";

type CoachNoteRow = {
  id: string;
  college_id: string;
  player_id: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

const NOTE_SELECT =
  "id, college_id, player_id, status, notes, created_at, updated_at";

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
  const collegeId = await requireCollegeId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coach_notes")
    .select(NOTE_SELECT)
    .eq("college_id", collegeId)
    .eq("player_id", playerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;
  return mapRowToCoachNote(data as CoachNoteRow);
}

/** Create or update the current college's note for a player. */
export async function saveCoachNote(
  playerId: string,
  status: CoachNoteStatus,
  notes: string,
): Promise<CoachNote> {
  if (!isCoachNoteStatus(status)) {
    throw new Error("Invalid coach note status.");
  }

  const collegeId = await requireCollegeId();
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("coach_notes")
    .upsert(
      {
        college_id: collegeId,
        player_id: playerId,
        status,
        notes,
        updated_at: now,
      },
      { onConflict: "college_id,player_id" },
    )
    .select(NOTE_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToCoachNote(data as CoachNoteRow);
}

/** Delete the current college's note for a player. */
export async function deleteCoachNote(playerId: string): Promise<void> {
  const collegeId = await requireCollegeId();
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

/** All notes for the current college (newest first). */
export async function listCoachNotes(): Promise<CoachNote[]> {
  const collegeId = await getCurrentCollegeId();
  if (!collegeId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coach_notes")
    .select(NOTE_SELECT)
    .eq("college_id", collegeId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data as CoachNoteRow[] | null) ?? []).map(mapRowToCoachNote);
}

export async function countCoachNotesByStatus(
  status: CoachNoteStatus,
): Promise<number> {
  const collegeId = await getCurrentCollegeId();
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

export async function getRecentCoachNotes(limit = 5): Promise<CoachNote[]> {
  const notes = await listCoachNotes();
  return notes.slice(0, limit);
}
