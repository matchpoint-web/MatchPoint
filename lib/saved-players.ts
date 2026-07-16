const STORAGE_KEY = "matchpoint-saved-players";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function getSavedPlayerIds(): string[] {
  return readIds();
}

export function isPlayerSaved(playerId: string): boolean {
  return readIds().includes(playerId);
}

export function toggleSavedPlayer(playerId: string): boolean {
  const ids = readIds();
  const index = ids.indexOf(playerId);
  if (index >= 0) {
    ids.splice(index, 1);
    writeIds(ids);
    return false;
  }
  ids.push(playerId);
  writeIds(ids);
  return true;
}

export function setPlayerSaved(playerId: string, saved: boolean): void {
  const ids = new Set(readIds());
  if (saved) ids.add(playerId);
  else ids.delete(playerId);
  writeIds([...ids]);
}

export function removeSavedPlayer(playerId: string): void {
  setPlayerSaved(playerId, false);
}
