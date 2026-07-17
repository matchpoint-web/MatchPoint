import Link from "next/link";
import { type PlayerProfile } from "@/lib/player-profile";
import { GlassCard } from "../GlassCard";

type ProfileHeroProps = {
  profile: PlayerProfile;
};

const stats = (profile: PlayerProfile) => [
  { label: "Country", value: `${profile.country} ${profile.countryFlag}`.trim() },
  { label: "Age", value: profile.age > 0 ? String(profile.age) : "—" },
  { label: "Graduation Year", value: profile.graduationYear },
  { label: "UTR", value: profile.utr },
  { label: "GPA", value: profile.gpa },
  { label: "Height", value: profile.height },
  { label: "Weight", value: profile.weight },
  { label: "Handedness", value: profile.handedness },
];

export function ProfileHero({ profile }: ProfileHeroProps) {
  return (
    <GlassCard className="p-6 sm:p-8 lg:p-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
        <div className="mx-auto shrink-0 lg:mx-0">
          <div className="relative">
            <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-500/30 bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-xl shadow-emerald-500/10 sm:h-44 sm:w-44">
              {profile.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.profileImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <svg
                  className="h-16 w-16 text-zinc-600 sm:h-20 sm:w-20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20 backdrop-blur-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
          </div>
          <p className="mt-3 text-center text-xs font-medium uppercase tracking-wider text-zinc-500">
            Profile Photo
          </p>
        </div>

        <div className="flex-1">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-emerald-400">
            Player Name
          </p>
          <h1 className="mb-8 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl lg:text-5xl">
            {profile.name}
          </h1>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {stats(profile).map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 transition-colors hover:border-emerald-500/15 hover:bg-white/[0.05]"
              >
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500 sm:text-xs">
                  {stat.label}
                </p>
                <p className="text-sm font-semibold text-white sm:text-base">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/player/profile/edit"
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition-all duration-300 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25"
            >
              Edit Profile
            </Link>
            <button
              type="button"
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
