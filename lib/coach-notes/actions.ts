"use server";

import { revalidatePath } from "next/cache";
import {
  isCoachNoteStatus,
  type CoachNote,
  type CoachNoteStatus,
} from "@/lib/coach-notes";
import {
  deleteCoachNote,
  getCoachNote,
  listCoachNotesPage,
  saveCoachNote,
  type CoachNotesPageResult,
} from "@/lib/coach-notes-service";

/** Load the current college's note for a player. */
export async function getCoachNoteAction(
  playerId: string,
): Promise<CoachNote | null> {
  if (!playerId?.trim()) return null;
  return getCoachNote(playerId.trim());
}

/** Create or update a coach note for a player. */
export async function saveCoachNoteAction(
  playerId: string,
  status: string,
  notes: string,
): Promise<{ error: string | null; note: CoachNote | null }> {
  if (!playerId?.trim()) {
    return { error: "Player id is required.", note: null };
  }
  if (!isCoachNoteStatus(status)) {
    return { error: "Invalid status.", note: null };
  }

  try {
    const note = await saveCoachNote(
      playerId.trim(),
      status as CoachNoteStatus,
      typeof notes === "string" ? notes : "",
    );
    revalidatePath(`/college/players/${playerId.trim()}`);
    revalidatePath("/college/dashboard");
    revalidatePath("/college/saved");
    revalidatePath("/college/messages");
    return { error: null, note };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save note.";
    return { error: message, note: null };
  }
}

/** Delete the current college's note for a player. */
export async function deleteCoachNoteAction(
  playerId: string,
): Promise<{ error: string | null }> {
  if (!playerId?.trim()) {
    return { error: "Player id is required." };
  }

  try {
    await deleteCoachNote(playerId.trim());
    revalidatePath(`/college/players/${playerId.trim()}`);
    revalidatePath("/college/dashboard");
    revalidatePath("/college/messages");
    return { error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete note.";
    return { error: message };
  }
}

/** Paginated notes for the current college (for future list UIs). */
export async function listCoachNotesAction(input: {
  page?: number;
  pageSize?: number;
} = {}): Promise<CoachNotesPageResult> {
  return listCoachNotesPage(input);
}
