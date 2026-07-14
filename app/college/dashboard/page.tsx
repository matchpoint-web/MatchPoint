import Link from "next/link";

const college = {
  name: "Stanford University",
  recruiter: "Coach Michael Rivera",
};

const dashboardCards = [
  {
    title: "Player Search",
    description: "Browse the global player database.",
    href: "/college/players",
  },
  {
    title: "Saved Players",
    description: "Players your staff has bookmarked.",
    href: "/college/saved",
  },
  {
    title: "Messages",
    description: "Communicate with recruits.",
    href: "/college/messages",
  },
];

export default function CollegeDashboard() {
  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-widest text-emerald-400">
                Welcome back
              </p>
              <h2 className="mb-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {college.recruiter}
              </h2>
              <p className="text-sm text-zinc-500 sm:text-base">
                {college.name}
              </p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 bg-gradient-to-br from-zinc-800 to-zinc-900 text-lg font-bold text-amber-400/80">
              SU
            </div>
          </div>
        </section>

        <section>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dashboardCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group rounded-3xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <h3 className="mb-2 text-lg font-semibold tracking-tight text-white">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500">
                  {card.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-6 sm:p-7">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-white">
                  Recent Activity
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Updates from players you have saved.
                </p>
              </div>
              <Link
                href="/college/saved"
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
              >
                View saved
              </Link>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-10 text-center">
              <p className="text-sm text-zinc-500">
                No recent activity yet. Updates from saved players will appear
                here.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
