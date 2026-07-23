"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { GlassCard } from "@/components/player/GlassCard";
import { SectionTitle } from "@/components/player/SectionTitle";
import { CoachNotes } from "@/components/college/players/profile/CoachNotes";
import { type CollegePlayerProfile } from "@/lib/college-player-profile";
import { type CoachNote } from "@/lib/coach-notes";
import { addRecentlyViewedAction } from "@/lib/recently-viewed/actions";
import { toggleSavedPlayerAction } from "@/lib/saved-players/actions";
import { getOrCreateConversationAction } from "@/lib/messages/actions";

type CollegeProfileViewProps = {
  profile: CollegePlayerProfile;
  collegeId: string | null;
  initiallySaved: boolean;
  initialCoachNote?: CoachNote | null;
  documentsSlot?: ReactNode;
};

function formatOptionalNumber(
  value: number | null,
  digits?: number,
): string | null {
  if (value == null) return null;
  return digits != null ? value.toFixed(digits) : String(value);
}

export function CollegeProfileView({
  profile,
  collegeId,
  initiallySaved,
  initialCoachNote = null,
  documentsSlot,
}: CollegeProfileViewProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initiallySaved);
  const [isPending, startTransition] = useTransition();
  const [isMessaging, setIsMessaging] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  useEffect(() => {
    setSaved(initiallySaved);
    void addRecentlyViewedAction(profile.id).catch(() => {
      // Non-blocking: viewing history must not break profile UI.
    });
  }, [profile.id, initiallySaved]);

  function handleToggleSave() {
    if (!collegeId) return;

    const previouslySaved = saved;
    setSaved(!previouslySaved);

    startTransition(async () => {
      try {
        const next = await toggleSavedPlayerAction(profile.id);
        setSaved(next);
      } catch {
        setSaved(previouslySaved);
      }
    });
  }

  async function handleMessagePlayer() {
    if (!collegeId || isMessaging) return;

    setIsMessaging(true);
    setMessageError(null);
    try {
      const conversationId = await getOrCreateConversationAction(profile.id);
      router.push(`/college/messages?c=${encodeURIComponent(conversationId)}`);
    } catch (error) {
      setIsMessaging(false);
      console.error("[college] Message Player failed", {
        playerId: profile.id,
        collegeId,
        error,
      });
      setMessageError("Could not open conversation. Try again.");
    }
  }

  const detailFields: { label: string; value: string | null }[] = [
    {
      label: "Country",
      value: profile.country
        ? `${profile.country}${profile.countryFlag ? ` ${profile.countryFlag}` : ""}`
        : null,
    },
    {
      label: "Graduation Year",
      value: profile.graduationYear || null,
    },
    {
      label: "Age",
      value: profile.age != null ? String(profile.age) : null,
    },
    {
      label: "UTR",
      value: formatOptionalNumber(profile.utr, 1),
    },
    {
      label: "GPA",
      value: formatOptionalNumber(profile.gpa, 1),
    },
    {
      label: "Height",
      value:
        profile.height != null ? `${formatOptionalNumber(profile.height)} cm` : null,
    },
    {
      label: "Weight",
      value:
        profile.weight != null ? `${formatOptionalNumber(profile.weight)} kg` : null,
    },
    {
      label: "Dominant Hand",
      value: profile.dominantHand,
    },
    {
      label: "Backhand",
      value: profile.backhand,
    },
  ];

  const filledDetails = detailFields.filter((f) => Boolean(f.value));
  const hasAbout = Boolean(profile.about?.trim());

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
                  aria-label={
                    profile.profileImageUrl
                      ? `${profile.name} profile photo`
                      : `${profile.name} — no profile photo`
                  }
                >
                  {profile.profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.profileImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : profile.initials ? (
                    <span aria-hidden>{profile.initials}</span>
                  ) : (
                    <span className="text-sm font-medium text-zinc-500">
                      No photo
                    </span>
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="mb-2 text-sm font-medium uppercase tracking-widest text-emerald-400">
                  Player
                </p>
                <h1 className="mb-6 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
                  {profile.name}
                </h1>

                {filledDetails.length > 0 ? (
                  <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {filledDetails.map((item) => (
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
                ) : (
                  <div className="mb-8 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-5 text-left">
                    <p className="text-sm text-zinc-500">
                      This player has not added profile details yet.
                    </p>
                  </div>
                )}

                <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <button
                    type="button"
                    onClick={handleToggleSave}
                    disabled={isPending || !collegeId}
                    className={`rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 disabled:opacity-60 ${
                      saved
                        ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                        : "bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25"
                    }`}
                  >
                    {saved ? "Saved" : "Save Player"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleMessagePlayer()}
                    disabled={!collegeId || isMessaging}
                    className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 disabled:opacity-60"
                  >
                    {isMessaging ? "Opening…" : "Message Player"}
                  </button>
                </div>
                {messageError ? (
                  <p className="mt-3 text-sm text-red-400" role="alert">
                    {messageError}
                  </p>
                ) : null}
              </div>
            </div>
          </GlassCard>

          <section>
            <SectionTitle title="Biography" />
            <GlassCard className="p-6 sm:p-8">
              {hasAbout ? (
                <p className="text-base leading-relaxed text-zinc-300 sm:text-lg">
                  {profile.about}
                </p>
              ) : (
                <p className="text-sm text-zinc-500">
                  No biography provided yet.
                </p>
              )}
            </GlassCard>
          </section>

          {documentsSlot}

          <CoachNotes playerId={profile.id} initialNote={initialCoachNote} />
        </div>
      </main>
    </div>
  );
}
