import Link from "next/link";
import { ProfileStrengthCard } from "@/components/profile/ProfileStrengthCard";
import { AmbientBackground } from "@/components/player/AmbientBackground";
import { SectionTitle } from "@/components/player/SectionTitle";
import { AboutSection } from "@/components/player/profile/AboutSection";
import { AchievementTimeline } from "@/components/player/profile/AchievementTimeline";
import { DocumentsSection } from "@/components/player/profile/DocumentsSection";
import { InfoGridSection } from "@/components/player/profile/InfoGridSection";
import { ProfileCompletion } from "@/components/player/profile/ProfileCompletion";
import { ProfileHero } from "@/components/player/profile/ProfileHero";
import { VideoGallery } from "@/components/player/profile/VideoGallery";
import { getDefaultDocumentsState } from "@/lib/player-documents";
import { getPlayerDocuments } from "@/lib/player-documents-service";
import { getPlayerProfileView } from "@/lib/player-profile-service";

export default async function PlayerProfilePage() {
  const view = await getPlayerProfileView();

  let documents = getDefaultDocumentsState();
  try {
    documents = await getPlayerDocuments();
  } catch {
    documents = getDefaultDocumentsState();
  }

  const {
    profile,
    academicInfo,
    tennisInfo,
    highlightVideos,
    achievements,
    strength,
    remainingSections,
  } = view;

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <AmbientBackground />

      <main className="relative z-10 px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
        <div className="mx-auto max-w-6xl space-y-16 sm:space-y-20 lg:space-y-24">
          <div className="flex items-center justify-between">
            <Link
              href="/player"
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
              Back to Dashboard
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2">
              <ProfileHero profile={profile} />
            </div>
            <ProfileStrengthCard strength={strength} />
          </div>

          <section>
            <SectionTitle title="About Me" />
            <AboutSection text={profile.about} />
          </section>

          <section>
            <SectionTitle title="Academic Information" />
            <InfoGridSection items={academicInfo} />
          </section>

          <section>
            <SectionTitle title="Tennis Information" />
            <InfoGridSection items={tennisInfo} />
          </section>

          <section>
            <SectionTitle
              title="Highlight Videos"
              subtitle="Showcase your best match play and training footage."
            />
            <VideoGallery videos={highlightVideos} />
          </section>

          <section>
            <SectionTitle title="Achievements" />
            <AchievementTimeline achievements={achievements} />
          </section>

          <section>
            <SectionTitle title="Documents" />
            <DocumentsSection initialDocuments={documents} />
          </section>

          <section>
            <ProfileCompletion
              completion={profile.completion}
              remainingSections={remainingSections}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
