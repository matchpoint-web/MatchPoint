import Link from "next/link";

const profile = {
  name: "Alex Tanaka",
  country: "Japan",
  graduationYear: "2027",
  utr: "11.2",
  gpa: "3.8",
  completion: 72,
};

const dashboardCards = [
  {
    title: "Profile Completion",
    description: "Complete your profile to get discovered by college coaches.",
    icon: "📋",
    href: "/player/profile" as string | null,
  },
  {
    title: "Messages",
    description: "Connect directly with coaches and recruiters worldwide.",
    icon: "💬",
    href: null,
  },
  {
    title: "Documents",
    description: "Upload your transcript and English test scores.",
    icon: "📄",
    href: "/player/profile",
  },
];

export default function PlayerDashboard() {
  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-500 sm:h-28 sm:w-28">
              <svg
                className="h-12 w-12 sm:h-14 sm:w-14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="mb-4 text-2xl font-semibold text-white sm:text-3xl">
                {profile.name}
              </h2>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "Country", value: profile.country },
                  { label: "Graduation Year", value: profile.graduationYear },
                  { label: "UTR Rating", value: profile.utr },
                  { label: "GPA", value: profile.gpa },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
                  >
                    <p className="mb-1 text-xs uppercase tracking-wider text-zinc-500">
                      {stat.label}
                    </p>
                    <p className="font-medium text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-sm font-medium uppercase tracking-wider text-zinc-500">
                Profile Completion
              </p>
              <p className="text-4xl font-bold tracking-tight text-emerald-400">
                {profile.completion}%
              </p>
              <p className="mt-2 max-w-md text-sm text-zinc-500">
                Complete 2 more sections to improve your visibility to college
                coaches.
              </p>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5 sm:max-w-xs">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                style={{ width: `${profile.completion}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
          {dashboardCards.map((card) => {
            const className =
              "group relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5";
            const content = (
              <div className="relative">
                <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-2xl transition-transform duration-300 group-hover:scale-110">
                  {card.icon}
                </span>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500">
                  {card.description}
                </p>
              </div>
            );

            if (card.href) {
              return (
                <Link key={card.title} href={card.href} className={className}>
                  {content}
                </Link>
              );
            }

            return (
              <div key={card.title} className={className}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
