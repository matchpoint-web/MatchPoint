const STORAGE_KEY = "matchpoint-saved-players";

export type SavedPlayerEntry = {
  playerId: string;
  savedAt: string;
};

function isSavedPlayerEntry(value: unknown): value is SavedPlayerEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.playerId === "string" && typeof entry.savedAt === "string"
  );
}

function readEntries(): SavedPlayerEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);

    // Legacy format: string[]
    if (Array.isArray(parsed) && parsed.every((id) => typeof id === "string")) {
      const now = new Date(0).toISOString();
      return (parsed as string[]).map((playerId, index) => ({
        playerId,
        // Preserve relative order with increasing timestamps.
        savedAt: new Date(new Date(now).getTime() + index).toISOString(),
      }));
    }

    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedPlayerEntry);
  } catch {
    return [];
  }
}

function writeEntries(entries: SavedPlayerEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getSavedPlayerEntries(): SavedPlayerEntry[] {
  return readEntries();
}

export function getSavedPlayerIds(): string[] {
  return readEntries().map((entry) => entry.playerId);
}

export function getSavedPlayersCount(): number {
  return readEntries().length;
}

export function getRecentSavedPlayerIds(limit = 5): string[] {
  return [...readEntries()]
    .sort(
      (a, b) =>
        new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    )
    .slice(0, limit)
    .map((entry) => entry.playerId);
}

export function isPlayerSaved(playerId: string): boolean {
  return readEntries().some((entry) => entry.playerId === playerId);
}

export function toggleSavedPlayer(playerId: string): boolean {
  const entries = readEntries();
  const index = entries.findIndex((entry) => entry.playerId === playerId);

  if (index >= 0) {
    entries.splice(index, 1);
    writeEntries(entries);
    return false;
  }

  entries.push({
    playerId,
    savedAt: new Date().toISOString(),
  });
  writeEntries(entries);
  return true;
}

export function setPlayerSaved(playerId: string, saved: boolean): void {
  const entries = readEntries().filter((entry) => entry.playerId !== playerId);
  if (saved) {
    entries.push({
      playerId,
      savedAt: new Date().toISOString(),
    });
  }
  writeEntries(entries);
}

export function removeSavedPlayer(playerId: string): void {
  setPlayerSaved(playerId, false);
}
