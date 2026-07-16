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
  saveCoachNote,
} from "@/lib/coach-notes-service";

export async function getCoachNoteAction(
  playerId: string,
): Promise<CoachNote | null> {
  return getCoachNote(playerId);
}

export async function saveCoachNoteAction(
  playerId: string,
  status: string,
  notes: string,
): Promise<{ error: string | null; note: CoachNote | null }> {
  if (!isCoachNoteStatus(status)) {
    return { error: "Invalid status.", note: null };
  }

  try {
    const note = await saveCoachNote(
      playerId,
      status as CoachNoteStatus,
      notes,
    );
    revalidatePath(`/college/players/${playerId}`);
    revalidatePath("/college/dashboard");
    revalidatePath("/college/saved");
    return { error: null, note };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save note.";
    return { error: message, note: null };
  }
}

export async function deleteCoachNoteAction(
  playerId: string,
): Promise<{ error: string | null }> {
  try {
    await deleteCoachNote(playerId);
    revalidatePath(`/college/players/${playerId}`);
    revalidatePath("/college/dashboard");
    return { error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete note.";
    return { error: message };
  }
}
