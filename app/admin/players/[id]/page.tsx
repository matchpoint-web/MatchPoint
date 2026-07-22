import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountStatusBadge } from "@/components/admin/AccountStatusBadge";
import { AdminPlayerActions } from "@/components/admin/AdminPlayerActions";
import { GlassCard } from "@/components/player/GlassCard";
import { formatSuspendedReason } from "@/lib/account-status";
import { getAdminPlayer } from "@/lib/admin-service";

export default async function AdminPlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await getAdminPlayer(id);

  if (!player) {
    notFound();
  }

  const fields: Array<{ label: string; value: string }> = [
    { label: "Nationality", value: player.nationality ?? "—" },
    {
      label: "Graduation year",
      value: player.graduationYear?.toString() ?? "—",
    },
    { label: "UTR", value: player.utr?.toString() ?? "—" },
    { label: "GPA", value: player.gpa?.toString() ?? "—" },
    { label: "Height", value: player.height?.toString() ?? "—" },
    { label: "Weight", value: player.weight?.toString() ?? "—" },
    { label: "Dominant hand", value: player.dominantHand ?? "—" },
    { label: "Backhand", value: player.backhand ?? "—" },
    { label: "Date of birth", value: player.dateOfBirth ?? "—" },
    {
      label: "Created",
      value: new Date(player.createdAt).toLocaleString(),
    },
  ];

  if (player.accountStatus === "SUSPENDED") {
    fields.push(
      {
        label: "Suspended reason",
        value: player.suspendedReason
          ? formatSuspendedReason(player.suspendedReason)
          : "—",
      },
      {
        label: "Suspended at",
        value: player.suspendedAt
          ? new Date(player.suspendedAt).toLocaleString()
          : "—",
      },
      {
        label: "Suspended by",
        value: player.suspendedBy ?? "—",
      },
    );
  }

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/admin/players"
          className="inline-flex text-sm text-zinc-500 transition hover:text-zinc-300"
        >
          ← Back to players
        </Link>

        <GlassCard className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                {player.fullName}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">ID: {player.id}</p>
            </div>
            <AccountStatusBadge status={player.accountStatus} />
          </div>

          {player.bio ? (
            <p className="text-sm leading-relaxed text-zinc-300">{player.bio}</p>
          ) : null}

          <dl className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.label}>
                <dt className="text-xs uppercase tracking-wider text-zinc-500">
                  {field.label}
                </dt>
                <dd className="mt-1 text-sm text-zinc-200">{field.value}</dd>
              </div>
            ))}
          </dl>

          <AdminPlayerActions
            playerId={player.id}
            accountStatus={player.accountStatus}
          />
        </GlassCard>
      </div>
    </div>
  );
}
