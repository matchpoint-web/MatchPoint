import { PlayerSearchClient } from "@/components/college/players/PlayerSearchClient";

export default function PlayerSearchPage() {
  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="mb-6 text-sm text-zinc-500 sm:text-base">
          Discover tennis players from around the world.
        </p>
        <PlayerSearchClient />
      </div>
    </div>
  );
}
