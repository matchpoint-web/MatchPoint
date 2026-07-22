import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountStatusBadge } from "@/components/admin/AccountStatusBadge";
import { AdminCollegeActions } from "@/components/admin/AdminCollegeActions";
import { GlassCard } from "@/components/player/GlassCard";
import { formatSuspendedReason } from "@/lib/account-status";
import { getAdminCollege } from "@/lib/admin-service";

export default async function AdminCollegeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const college = await getAdminCollege(id);

  if (!college) {
    notFound();
  }

  const fields: Array<{ label: string; value: string }> = [
    { label: "Division", value: college.division ?? "—" },
    { label: "Conference", value: college.conference ?? "—" },
    {
      label: "Location",
      value:
        [college.city, college.state].filter(Boolean).join(", ") ||
        college.location ||
        "—",
    },
    { label: "Website", value: college.website ?? "—" },
    { label: "Head coach", value: college.headCoach ?? "—" },
    { label: "Assistant coach", value: college.assistantCoach ?? "—" },
    { label: "Contact email", value: college.contactEmail ?? "—" },
    {
      label: "Created",
      value: new Date(college.createdAt).toLocaleString(),
    },
  ];

  if (college.accountStatus === "SUSPENDED") {
    fields.push(
      {
        label: "Suspended reason",
        value: college.suspendedReason
          ? formatSuspendedReason(college.suspendedReason)
          : "—",
      },
      {
        label: "Suspended at",
        value: college.suspendedAt
          ? new Date(college.suspendedAt).toLocaleString()
          : "—",
      },
      {
        label: "Suspended by",
        value: college.suspendedBy ?? "—",
      },
    );
  }

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/admin/colleges"
          className="inline-flex text-sm text-zinc-500 transition hover:text-zinc-300"
        >
          ← Back to colleges
        </Link>

        <GlassCard className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                {college.schoolName}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">ID: {college.id}</p>
            </div>
            <AccountStatusBadge status={college.accountStatus} />
          </div>

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

          {college.aboutProgram ? (
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                About program
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                {college.aboutProgram}
              </p>
            </div>
          ) : null}

          <AdminCollegeActions
            collegeId={college.id}
            accountStatus={college.accountStatus}
          />
        </GlassCard>
      </div>
    </div>
  );
}
