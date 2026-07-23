import Link from "next/link";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/player/GlassCard";
import {
  formatAcademicRanking,
  formatCostOfAttendance,
} from "@/lib/colleges";
import { getCollegeById } from "@/lib/college-search-service";

type CollegeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CollegeDetailPage({
  params,
}: CollegeDetailPageProps) {
  const { id } = await params;

  let college;
  try {
    college = await getCollegeById(id);
  } catch {
    notFound();
  }

  if (!college) {
    notFound();
  }

  const details: { label: string; value: string }[] = [
    { label: "Division", value: college.division },
    ...(college.conference
      ? [{ label: "Conference", value: college.conference }]
      : []),
    ...(college.state ? [{ label: "State", value: college.state }] : []),
    ...(college.city ? [{ label: "City", value: college.city }] : []),
    ...(college.academicRanking != null
      ? [
          {
            label: "Academic Ranking",
            value: formatAcademicRanking(college.academicRanking),
          },
        ]
      : []),
    ...(college.averageTeamUtr != null
      ? [
          {
            label: "Average Team UTR",
            value: college.averageTeamUtr.toFixed(1),
          },
        ]
      : []),
    ...(college.rosterSize != null
      ? [{ label: "Roster Size", value: String(college.rosterSize) }]
      : []),
    ...(college.internationalPlayers != null
      ? [
          {
            label: "International Players",
            value: String(college.internationalPlayers),
          },
        ]
      : []),
    ...(college.costOfAttendance != null
      ? [
          {
            label: "Cost of Attendance",
            value: formatCostOfAttendance(college.costOfAttendance),
          },
        ]
      : []),
    ...(college.coach ? [{ label: "Head Coach", value: college.coach }] : []),
    ...(college.contact ? [{ label: "Contact", value: college.contact }] : []),
  ];

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link
          href="/player/colleges"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          Back to College Search
        </Link>

        <GlassCard className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            <div
              className="mx-auto flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900 text-lg font-bold tracking-wide text-emerald-400/90 sm:mx-0 sm:h-28 sm:w-28"
              aria-label={`${college.name} logo`}
            >
              {college.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={college.logoUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                college.initials
              )}
            </div>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="mb-2 text-sm font-medium uppercase tracking-widest text-emerald-400">
                University
              </p>
              <h1 className="mb-3 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
                {college.name}
              </h1>
              <p className="text-sm text-zinc-500">
                {college.division}
                {college.conference ? ` · ${college.conference}` : ""}
                {college.city || college.state
                  ? ` · ${[college.city, college.state].filter(Boolean).join(", ")}`
                  : ""}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-start">
                {college.website ? (
                  <a
                    href={college.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25"
                  >
                    Visit Website
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </GlassCard>

        {details.length > 0 ? (
          <GlassCard className="p-6 sm:p-8">
            <h2 className="mb-5 text-xl font-semibold tracking-tight text-white">
              Program Details
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {details.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5"
                >
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500 sm:text-xs">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-white sm:text-base">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        ) : null}

        {college.about ? (
          <GlassCard className="p-6 sm:p-8">
            <h2 className="mb-3 text-xl font-semibold tracking-tight text-white">
              About the Program
            </h2>
            <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">
              {college.about}
            </p>
          </GlassCard>
        ) : null}

        {college.facilities ? (
          <GlassCard className="p-6 sm:p-8">
            <h2 className="mb-3 text-xl font-semibold tracking-tight text-white">
              Facilities
            </h2>
            <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">
              {college.facilities}
            </p>
          </GlassCard>
        ) : null}

        {college.website ? (
          <GlassCard className="p-6 sm:p-8">
            <h2 className="mb-3 text-xl font-semibold tracking-tight text-white">
              Website
            </h2>
            <a
              href={college.website}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-sm text-emerald-400 transition hover:text-emerald-300"
            >
              {college.website}
            </a>
          </GlassCard>
        ) : null}

        {college.contact || college.coach ? (
          <GlassCard className="p-6 sm:p-8">
            <h2 className="mb-3 text-xl font-semibold tracking-tight text-white">
              Contact
            </h2>
            {college.contact ? (
              <a
                href={`mailto:${college.contact}`}
                className="text-sm text-emerald-400 transition hover:text-emerald-300"
              >
                {college.contact}
              </a>
            ) : null}
            {college.coach ? (
              <p className="mt-2 text-sm text-zinc-500">
                Head Coach: {college.coach}
              </p>
            ) : null}
          </GlassCard>
        ) : null}
      </div>
    </div>
  );
}
