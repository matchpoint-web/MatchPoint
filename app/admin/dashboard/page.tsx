import { StatCard } from "@/components/player/StatCard";
import { getAdminDashboardStats } from "@/lib/admin-service";

export default async function AdminDashboardPage() {
  let stats = {
    activePlayers: 0,
    suspendedPlayers: 0,
    pendingColleges: 0,
    approvedColleges: 0,
    suspendedColleges: 0,
  };

  try {
    stats = await getAdminDashboardStats();
  } catch {
    // Keep zeros; page still renders.
  }

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <p className="text-sm text-zinc-500 sm:text-base">
          Operational overview of MatchPoint accounts.
        </p>

        <section className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
            Players
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Active"
              value={String(stats.activePlayers)}
            />
            <StatCard
              label="Suspended"
              value={String(stats.suspendedPlayers)}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
            Colleges
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Pending"
              value={String(stats.pendingColleges)}
            />
            <StatCard
              label="Approved"
              value={String(stats.approvedColleges)}
            />
            <StatCard
              label="Suspended"
              value={String(stats.suspendedColleges)}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
