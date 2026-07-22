import Link from "next/link";
import { AccountStatusBadge } from "@/components/admin/AccountStatusBadge";
import { AdminSearchForm } from "@/components/admin/AdminSearchForm";
import { GlassCard } from "@/components/player/GlassCard";
import { listAdminColleges } from "@/lib/admin-service";

export default async function AdminCollegesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  let colleges: Awaited<ReturnType<typeof listAdminColleges>> = [];
  let loadError: string | null = null;

  try {
    colleges = await listAdminColleges(query || undefined);
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Unable to load colleges.";
  }

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <p className="text-sm text-zinc-500 sm:text-base">
          Approve new college registrations and manage recruiting access.
        </p>

        <AdminSearchForm
          initialQuery={query}
          placeholder="Search by school, location, coach, or email"
        />

        {loadError ? (
          <GlassCard className="p-6 text-sm text-red-300">{loadError}</GlassCard>
        ) : colleges.length === 0 ? (
          <GlassCard className="p-8 text-center text-sm text-zinc-500">
            No colleges found.
          </GlassCard>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/[0.06] bg-white/[0.02] text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">College</th>
                    <th className="px-4 py-3 font-medium">Division</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {colleges.map((college) => (
                    <tr
                      key={college.id}
                      className="border-b border-white/[0.04] last:border-0"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">
                          {college.schoolName}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {college.headCoach ?? "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {college.division ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {[college.city, college.state]
                          .filter(Boolean)
                          .join(", ") ||
                          college.location ||
                          "—"}
                      </td>
                      <td className="px-4 py-3">
                        <AccountStatusBadge status={college.accountStatus} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/colleges/${college.id}`}
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
