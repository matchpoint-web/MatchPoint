import { type Player } from "@/lib/player-service";
import { type SavedPlayerRecord } from "@/lib/saved-player-service";

export type DashboardStatCard = {
  title: string;
  value: number;
  href: string;
  description: string;
};

export type RecentSavedPlayerRow = {
  player: Player;
};

export function getDashboardStats(input: {
  savedPlayersCount: number;
  unreadMessages: number;
  playersCount: number;
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
