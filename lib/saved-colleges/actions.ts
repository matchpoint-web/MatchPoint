"use server";

import { revalidatePath } from "next/cache";
import {
  getSavedCollegeIds,
  getSavedColleges,
  isCollegeSaved,
  removeSavedCollege,
  saveCollege,
  toggleSavedCollege,
} from "@/lib/saved-college-service";
import type { College } from "@/lib/colleges";

function revalidateSavedCollegePages() {
  revalidatePath("/player");
  revalidatePath("/player/colleges");
}

/** Toggle save for the current player. Returns true when the college is saved. */
export async function toggleSavedCollegeAction(
  collegeId: string,
): Promise<boolean> {
  if (!collegeId?.trim()) {
    throw new Error("College id is required.");
  }
  const next = await toggleSavedCollege(collegeId.trim());
  revalidateSavedCollegePages();
  return next;
}

export async function removeSavedCollegeAction(
  collegeId: string,
): Promise<void> {
  if (!collegeId?.trim()) {
    throw new Error("College id is required.");
  }
  await removeSavedCollege(collegeId.trim());
  revalidateSavedCollegePages();
}

export async function saveCollegeAction(collegeId: string): Promise<void> {
  if (!collegeId?.trim()) {
    throw new Error("College id is required.");
  }
  await saveCollege(collegeId.trim());
  revalidateSavedCollegePages();
}

export async function isCollegeSavedAction(
  collegeId: string,
): Promise<boolean> {
  if (!collegeId?.trim()) return false;
  return isCollegeSaved(collegeId.trim());
}

export async function getSavedCollegeIdsAction(): Promise<string[]> {
  return getSavedCollegeIds();
}

export async function getSavedCollegesAction(): Promise<College[]> {
  return getSavedColleges();
}
