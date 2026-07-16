"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/player/GlassCard";
import { SectionTitle } from "@/components/player/SectionTitle";
import { CoachNotes } from "@/components/college/players/profile/CoachNotes";
import { type CollegePlayerProfile } from "@/lib/college-player-profile";
import {
  isPlayerSaved,
  toggleSavedPlayer,
} from "@/lib/saved-players";
import { trackPlayerView } from "@/lib/dashboard";

type CollegeProfileViewProps = {
  profile: CollegePlayerProfile;
};

export function CollegeProfileView({ profile }: CollegeProfileViewProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isPlayerSaved(profile.id));
    trackPlayerView(profile.id);
  }, [profile.id]);

  function handleToggleSave() {
    const next = toggleSavedPlayer(profile.id);
    setSaved(next);
  }

  const details = [
    { label: "Country", value: `${profile.country} ${profile.countryFlag}` },
    { label: "Graduation Year", value: profile.graduationYear },
    { label: "UTR", value: profile.utr.toFixed(1) },
    { label: "GPA", value: profile.gpa.toFixed(1) },
    { label: "Height", value: `${profile.height} cm` },
    { label: "Dominant Hand", value: profile.tennis.dominantHand },
    { label: "Backhand", value: profile.tennis.backhand },
  ];

  return (
    <div className="overflow-x-hidden text-white">
      <main className="relative z-10 px-6 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl space-y-8 sm:space-y-10">
          <Link
            href="/college/players"
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
            Back to Player Search
          </Link>

          <GlassCard className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
              <div className="mx-auto shrink-0 sm:mx-0">
                <div
                  className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-500/30 bg-gradient-to-br from-zinc-800 to-zinc-900 text-3xl font-bold text-emerald-400/80 shadow-xl shadow-emerald-500/10 sm:h-44 sm:w-44 sm:text-4xl"
                  aria-label={`${profile.name} profile photo`}
                >
                  {profile.initials}
                </div>
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="mb-2 text-sm font-medium uppercase tracking-widest text-emerald-400">
                  Player
                </p>
                <h1 className="mb-6 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
                  {profile.name}
                </h1>

                <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {details.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3"
                    >
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500 sm:text-xs">
                        {item.label}
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleToggleSave}
                  className={`rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                    saved
                      ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                      : "bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25"
                  }`}
                >
                  {saved ? "Saved" : "Save Player"}
                </button>
              </div>
            </div>
          </GlassCard>

          <section>
            <SectionTitle title="Biography" />
            <GlassCard className="p-6 sm:p-8">
              <p className="text-base leading-relaxed text-zinc-300 sm:text-lg">
                {profile.about}
              </p>
            </GlassCard>
          </section>

          <CoachNotes playerId={profile.id} />
        </div>
      </main>
    </div>
  );
}
