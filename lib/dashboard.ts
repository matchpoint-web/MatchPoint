import { type Player } from "@/lib/player-service";
import { type SavedPlayerRecord } from "@/lib/saved-player-service";

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
  player: Player;
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

export function getDashboardStats(input: {
  savedPlayersCount: number;
  unreadMessages: number;
  playersCount: number;
  recentlyViewedCount: number;
}): DashboardStatCard[] {
  return [
    {
      title: "Saved Players",
      value: input.savedPlayersCount,
      href: "/college/saved",
      description: "Players bookmarked for recruiting",
    },
    {
      title: "Messages",
      value: input.unreadMessages,
      href: "/college/messages",
      description:
        input.unreadMessages === 1
          ? "1 unread message"
          : `${input.unreadMessages} unread messages`,
    },
    {
      title: "Player Search",
      value: input.playersCount,
      href: "/college/players",
      description: "Browse and discover recruits",
    },
    {
      title: "Recently Viewed",
      value: input.recentlyViewedCount,
      href: "/college/players",
      description: "Player profiles you opened",
    },
  ];
}

export function getRecentSavedPlayers(
  players: Player[],
  savedRecords: SavedPlayerRecord[],
  limit = 5,
): RecentSavedPlayerRow[] {
  const byId = new Map(players.map((player) => [player.id, player]));

  return savedRecords
    .slice(0, limit)
    .map((record) => byId.get(record.player_id))
    .filter((player): player is Player => Boolean(player))
    .map((player) => ({ player }));
}

export function getRecentViewedPlayers(
  players: Player[],
  limit = 5,
): RecentSavedPlayerRow[] {
  const ids = getRecentlyViewedPlayerIds(limit);
  const byId = new Map(players.map((player) => [player.id, player]));

  return ids
    .map((id) => byId.get(id))
    .filter((player): player is Player => Boolean(player))
    .map((player) => ({ player }));
}
