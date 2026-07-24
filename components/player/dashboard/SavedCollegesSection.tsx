import Link from "next/link";
import type { College } from "@/lib/colleges";

type SavedCollegesSectionProps = {
  colleges: College[];
};

/** Server-rendered Saved Colleges list (data from saved_colleges via Supabase). */
export function SavedCollegesSection({ colleges }: SavedCollegesSectionProps) {
  return (
    <section className="rounded-3xl border border-white/8 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-6 sm:p-8">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-white">
            Saved Colleges
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Colleges you saved from College Search.
          </p>
        </div>
        <Link
          href="/player/colleges"
          className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
        >
          Browse colleges
        </Link>
      </div>

      {colleges.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-10 text-center">
          <p className="text-sm text-zinc-500">No saved colleges yet.</p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {colleges.map((college) => (
            <li key={college.id}>
              <Link
                href={`/player/colleges/${college.id}`}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-3 transition hover:border-emerald-500/20 hover:bg-white/[0.05]"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900 text-xs font-bold text-emerald-400/80"
                  aria-hidden
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
                  <p className="truncate text-sm font-semibold text-white">
                    {college.name}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {[college.city, college.state].filter(Boolean).join(", ")}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                    {college.division}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
