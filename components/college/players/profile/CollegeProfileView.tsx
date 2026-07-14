"use client";

import Link from "next/link";
import { useState } from "react";
import { GlassCard } from "@/components/player/GlassCard";
import { SectionTitle } from "@/components/player/SectionTitle";
import { ProfileStrengthCard } from "@/components/profile/ProfileStrengthCard";
import { CoachNotesCRM } from "@/components/college/players/profile/CoachNotesCRM";
import { CommunicationHistory } from "@/components/college/players/profile/CommunicationHistory";
import { type CollegePlayerProfile } from "@/lib/college-player-profile";

type CollegeProfileViewProps = {
  profile: CollegePlayerProfile;
};

function StatGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5"
        >
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
            {item.label}
          </p>
          <p className="text-sm font-semibold text-white">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function CollegeProfileView({ profile }: CollegeProfileViewProps) {
  const [saved, setSaved] = useState(false);
  const [invited, setInvited] = useState(false);

  const headerStats = [
    { label: "Country", value: `${profile.country} ${profile.countryFlag}` },
    { label: "Graduation Year", value: profile.graduationYear },
    { label: "Age", value: String(profile.age) },
    { label: "UTR", value: profile.utr.toFixed(1) },
    { label: "GPA", value: profile.gpa.toFixed(1) },
    { label: "Preferred NCAA Division", value: profile.division },
    { label: "Current School", value: profile.currentSchool },
  ];

  return (
    <div className="overflow-x-hidden pb-28 text-white">
      <main className="relative z-10 px-6 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl space-y-12 sm:space-y-16">
          <Link
            href="/college/players"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Player Search
          </Link>

          {/* Header */}
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            <GlassCard className="p-6 sm:p-8 lg:col-span-2 lg:p-10">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
                <div className="mx-auto shrink-0 lg:mx-0">
                  <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-500/30 bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-xl shadow-emerald-500/10 sm:h-44 sm:w-44">
                    <span className="text-3xl font-bold text-emerald-400/80 sm:text-4xl">
                      {profile.initials}
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <h1 className="mb-6 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl lg:text-5xl">
                    {profile.name}
                  </h1>

                  <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {headerStats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3"
                      >
                        <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500 sm:text-xs">
                          {stat.label}
                        </p>
                        <p className="text-sm font-semibold text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSaved((s) => !s)}
                      className={`rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                        saved
                          ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                          : "bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25"
                      }`}
                    >
                      {saved ? "Saved" : "Save Player"}
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10"
                    >
                      Message Player
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvited((i) => !i)}
                      className={`rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                        invited
                          ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                          : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/20"
                      }`}
                    >
                      {invited ? "Invited" : "Invite To Recruiting List"}
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>

            <ProfileStrengthCard strength={profile.profileStrength} />
          </div>

          {/* About */}
          <section>
            <SectionTitle title="About" />
            <GlassCard className="p-6 sm:p-8">
              <p className="text-base leading-relaxed text-zinc-300 sm:text-lg">
                {profile.about}
              </p>
            </GlassCard>
          </section>

          {/* Academics */}
          <section>
            <SectionTitle title="Academics" />
            <GlassCard className="p-6 sm:p-8">
              <StatGrid
                items={[
                  { label: "High School", value: profile.academics.highSchool },
                  {
                    label: "Graduation Date",
                    value: profile.academics.graduationDate,
                  },
                  { label: "GPA", value: profile.academics.gpa },
                  { label: "SAT", value: profile.academics.sat },
                  { label: "ACT", value: profile.academics.act },
                  { label: "TOEFL", value: profile.academics.toefl },
                  { label: "IELTS", value: profile.academics.ielts },
                  {
                    label: "Duolingo English Test",
                    value: profile.academics.duolingo,
                  },
                  {
                    label: "Intended Major",
                    value: profile.academics.intendedMajor,
                  },
                ]}
              />
            </GlassCard>
          </section>

          {/* Tennis */}
          <section>
            <SectionTitle title="Tennis" />
            <GlassCard className="p-6 sm:p-8">
              <StatGrid
                items={[
                  { label: "UTR", value: profile.tennis.utr },
                  { label: "ITF Ranking", value: profile.tennis.itfRanking },
                  {
                    label: "National Ranking",
                    value: profile.tennis.nationalRanking,
                  },
                  { label: "USTA Ranking", value: profile.tennis.ustaRanking },
                  {
                    label: "Preferred Division",
                    value: profile.tennis.preferredDivision,
                  },
                  {
                    label: "Playing Style",
                    value: profile.tennis.playingStyle,
                  },
                  {
                    label: "Dominant Hand",
                    value: profile.tennis.dominantHand,
                  },
                  { label: "Height", value: profile.tennis.height },
                ]}
              />
            </GlassCard>
          </section>

          {/* Highlight Videos */}
          <section>
            <SectionTitle title="Highlight Videos" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {profile.videos.map((video) => (
                <GlassCard key={video.id} hover className="group">
                  <div className="relative aspect-video overflow-hidden rounded-t-3xl bg-gradient-to-br from-zinc-800 to-zinc-900">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.12)_0%,_transparent_70%)]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        type="button"
                        aria-label={`Watch ${video.title}`}
                        className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/20"
                      >
                        <svg className="ml-0.5 h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                    <span className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-zinc-300 backdrop-blur-sm">
                      {video.duration}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="mb-3 font-semibold tracking-tight text-white">
                      {video.title}
                    </h3>
                    <button
                      type="button"
                      className="w-full rounded-2xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-sm font-semibold text-emerald-400 transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-500/20"
                    >
                      Watch
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>

          {/* Tournament Results */}
          <section>
            <SectionTitle title="Tournament Results" />
            <GlassCard className="p-6 sm:p-8">
              <div className="space-y-0">
                {profile.tournaments.map((item, index) => (
                  <div key={item.id} className="relative flex gap-5 pb-10 last:pb-0">
                    {index < profile.tournaments.length - 1 && (
                      <div className="absolute left-[11px] top-6 h-[calc(100%-12px)] w-px bg-gradient-to-b from-emerald-500/40 to-white/5" />
                    )}
                    <div className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="font-semibold tracking-tight text-white">
                          {item.title}
                        </h3>
                        <span className="text-sm font-medium text-emerald-400">
                          {item.year}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-zinc-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </section>

          {/* Documents */}
          <section>
            <SectionTitle title="Documents" />
            <div className="grid gap-5 sm:grid-cols-2">
              {profile.documents.map((doc) => (
                <GlassCard key={doc.id} hover className="p-6">
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {doc.name}
                  </h3>
                  <p
                    className={`mb-5 text-sm font-medium ${
                      doc.status === "available"
                        ? "text-emerald-400"
                        : "text-zinc-500"
                    }`}
                  >
                    {doc.status === "available" ? "Available" : "Not uploaded"}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={doc.status === "missing"}
                      className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-zinc-300 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      disabled={doc.status === "missing"}
                      className="flex-1 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-sm font-semibold text-emerald-400 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Download
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>

          <CoachNotesCRM playerId={profile.id} playerName={profile.name} />

          <CommunicationHistory
            playerId={profile.id}
            playerName={profile.name}
          />
        </div>
      </main>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/[0.06] bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-center sm:gap-4 sm:px-10 lg:px-16">
          <button
            type="button"
            className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 sm:min-w-[180px]"
          >
            Message Player
          </button>
          <button
            type="button"
            onClick={() => setSaved(true)}
            className="rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-black transition-all duration-300 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25 sm:min-w-[180px]"
          >
            Save Player
          </button>
          <button
            type="button"
            onClick={() => setInvited((i) => !i)}
            className={`rounded-2xl px-6 py-3.5 text-sm font-semibold transition-all duration-300 sm:min-w-[220px] ${
              invited
                ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/20"
            }`}
          >
            {invited ? "Invited" : "Invite To Recruiting List"}
          </button>
        </div>
      </div>
    </div>
  );
}
