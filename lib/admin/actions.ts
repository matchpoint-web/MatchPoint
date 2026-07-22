"use server";

import { revalidatePath } from "next/cache";
import {
  approveCollege,
  restoreCollege,
  restorePlayer,
  suspendCollege,
  suspendPlayer,
} from "@/lib/admin-service";
import type { AdminActionResult } from "@/lib/admin/types";

function revalidateAdminPaths(playerId?: string, collegeId?: string) {
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/players");
  revalidatePath("/admin/colleges");
  if (playerId) {
    revalidatePath(`/admin/players/${playerId}`);
  }
  if (collegeId) {
    revalidatePath(`/admin/colleges/${collegeId}`);
  }
}

export async function suspendPlayerAction(
  playerId: string,
  reason: string,
): Promise<AdminActionResult> {
  try {
    await suspendPlayer(playerId, reason);
    revalidateAdminPaths(playerId);
    return { error: null, success: "Player suspended." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to suspend player.",
      success: null,
    };
  }
}

export async function restorePlayerAction(
  playerId: string,
): Promise<AdminActionResult> {
  try {
    await restorePlayer(playerId);
    revalidateAdminPaths(playerId);
    return { error: null, success: "Player restored." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to restore player.",
      success: null,
    };
  }
}

export async function approveCollegeAction(
  collegeId: string,
): Promise<AdminActionResult> {
  try {
    await approveCollege(collegeId);
    revalidateAdminPaths(undefined, collegeId);
    return { error: null, success: "College approved." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to approve college.",
      success: null,
    };
  }
}

export async function suspendCollegeAction(
  collegeId: string,
  reason: string,
): Promise<AdminActionResult> {
  try {
    await suspendCollege(collegeId, reason);
    revalidateAdminPaths(undefined, collegeId);
    return { error: null, success: "College suspended." };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to suspend college.",
      success: null,
    };
  }
}

export async function restoreCollegeAction(
  collegeId: string,
): Promise<AdminActionResult> {
  try {
    await restoreCollege(collegeId);
    revalidateAdminPaths(undefined, collegeId);
    return { error: null, success: "College restored." };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to restore college.",
      success: null,
    };
  }
}
