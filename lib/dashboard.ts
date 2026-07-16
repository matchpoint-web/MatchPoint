import { mockPlayers, type MockPlayer } from "@/lib/mock-players";
import {
  countCoachNotesByStatus,
  getRecentCoachNotes,
  type CoachNote,
} from "@/lib/coach-notes";
import {
  getRecentSavedPlayerIds,
  getSavedPlayersCount,
} from "@/lib/saved-players";

const RECENTLY_VIEWED_KEY = "matchpoint-recently-viewed";
const MAX_RECENTLY_VIEWED = 50;

export type RecentlyViewedEntry = {
  playerId: string;
  viewedAt: string;
};

export type DashboardStatCard = {
  title: string;
  value: number;
  href: string;
  description: string;
};

export type RecentSavedPlayerRow = {
  player: MockPlayer;
};

export type RecentCoachNoteRow = {
  note: CoachNote;
  playerName: string;
};

function isRecentlyViewedEntry(value: unknown): value is RecentlyViewedEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.playerId === "string" && typeof entry.viewedAt === "string"
  );
}

function readRecentlyViewed(): RecentlyViewedEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecentlyViewedEntry);
  } catch {
    return [];
  }
}

function writeRecentlyViewed(entries: RecentlyViewedEntry[]) {
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(entries));
}

export function trackPlayerView(playerId: string): void {
  const now = new Date().toISOString();
  const existing = readRecentlyViewed().filter(
    (entry) => entry.playerId !== playerId,
  );
  existing.unshift({ playerId, viewedAt: now });
  writeRecentlyViewed(existing.slice(0, MAX_RECENTLY_VIEWED));
}

export function getRecentlyViewedCount(): number {
  return readRecentlyViewed().length;
}

export function getRecentlyViewedPlayerIds(limit = 5): string[] {
  return readRecentlyViewed()
    .slice(0, limit)
    .map((entry) => entry.playerId);
}

function findPlayer(playerId: string): MockPlayer | undefined {
  return mockPlayers.find((player) => player.id === playerId);
}

export function getDashboardStats(): DashboardStatCard[] {
  return [
    {
      title: "Saved Players",
      value: getSavedPlayersCount(),
      href: "/college/saved",
      description: "Players bookmarked for recruiting",
    },
    {
      title: "Recruiting",
      value: countCoachNotesByStatus("Recruiting"),
      href: "/college/players",
      description: "Players marked as Recruiting",
    },
    {
      title: "Follow Up",
      value: countCoachNotesByStatus("Follow Up"),
      href: "/college/players",
      description: "Players needing follow-up",
    },
    {
      title: "Recently Viewed",
      value: getRecentlyViewedCount(),
      href: "/college/players",
      description: "Player profiles you opened",
    },
  ];
}

export function getRecentSavedPlayers(limit = 5): RecentSavedPlayerRow[] {
  return getRecentSavedPlayerIds(limit)
    .map((playerId) => findPlayer(playerId))
    .filter((player): player is MockPlayer => Boolean(player))
    .map((player) => ({ player }));
}

export function getRecentCoachNoteRows(limit = 5): RecentCoachNoteRow[] {
  return getRecentCoachNotes(limit).map((note) => ({
    note,
    playerName: findPlayer(note.playerId)?.name ?? "Unknown Player",
  }));
}

export function formatNoteUpdatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) {
    return "Not set";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
