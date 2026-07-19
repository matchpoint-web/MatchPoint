"use client";

import Link from "next/link";
import {
  formatAcademicRanking,
  formatCostOfAttendance,
  type College,
} from "@/lib/colleges";

type CollegeCardProps = {
  college: College;
  saved: boolean;
  onToggleSave: (id: string) => void;
};

export function CollegeCard({
  college,
  saved,
  onToggleSave,
}: CollegeCardProps) {
  const stats: { label: string; value: string }[] = [
    { label: "NCAA Division", value: college.division },
    ...(college.conference
      ? [{ label: "Conference", value: college.conference }]
      : []),
    ...(college.state ? [{ label: "State", value: college.state }] : []),
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
            label: "Avg Team UTR",
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
            label: "International",
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
  ];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 transition-all duration-500 group-hover:from-emerald-500/5 group-hover:to-transparent" />

      <div className="relative flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-4 flex items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900 text-xs font-bold tracking-wide text-emerald-400/90"
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
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold tracking-tight text-white">
              {college.name}
            </h3>
            <p className="text-sm text-zinc-500">
              {[college.city, college.state].filter(Boolean).join(", ") || "—"}
            </p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2"
            >
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                {stat.label}
              </p>
              <p className="truncate text-xs font-medium text-zinc-200">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-auto flex gap-2">
          <Link
            href={`/player/colleges/${college.id}`}
            className="flex-1 rounded-2xl bg-emerald-500 px-4 py-2.5 text-center text-sm font-semibold text-black transition-all duration-300 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20"
          >
            View Details
          </Link>
          <button
            type="button"
            onClick={() => onToggleSave(college.id)}
            className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
              saved
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                : "border-white/10 bg-white/5 text-zinc-300 hover:border-emerald-500/30 hover:bg-white/10"
            }`}
          >
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </article>
  );
}
