import Link from "next/link";
import { AccountStatusBadge } from "@/components/admin/AccountStatusBadge";
import { AdminSearchForm } from "@/components/admin/AdminSearchForm";
import { GlassCard } from "@/components/player/GlassCard";
import { listAdminPlayers } from "@/lib/admin-service";

export default async function AdminPlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  let players: Awaited<ReturnType<typeof listAdminPlayers>> = [];
  let loadError: string | null = null;

  try {
    players = await listAdminPlayers(query || undefined);
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Unable to load players.";
  }

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <p className="text-sm text-zinc-500 sm:text-base">
          Search and manage player account status. Suspended players cannot
          sign in or use the player portal.
        </p>

        <AdminSearchForm
          initialQuery={query}
          placeholder="Search by name or nationality"
        />

        {loadError ? (
          <GlassCard className="p-6 text-sm text-red-300">{loadError}</GlassCard>
        ) : players.length === 0 ? (
          <GlassCard className="p-8 text-center text-sm text-zinc-500">
            No players found.
          </GlassCard>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/[0.06] bg-white/[0.02] text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Player</th>
                    <th className="px-4 py-3 font-medium">UTR</th>
                    <th className="px-4 py-3 font-medium">Grad year</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr
                      key={player.id}
                      className="border-b border-white/[0.04] last:border-0"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">
                          {player.fullName}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {player.nationality ?? "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {player.utr ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {player.graduationYear ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <AccountStatusBadge status={player.accountStatus} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/players/${player.id}`}
                          className="text-emerald-400 transition hover:text-emerald-300"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
