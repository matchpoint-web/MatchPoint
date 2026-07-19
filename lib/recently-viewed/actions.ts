"use server";

import { addRecentlyViewed } from "@/lib/recently-viewed-service";

/** Record a player profile view for the current college (upsert). */
export async function addRecentlyViewedAction(playerId: string): Promise<void> {
  await addRecentlyViewed(playerId);
}
