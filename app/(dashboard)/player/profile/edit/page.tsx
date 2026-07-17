import Link from "next/link";
import { AmbientBackground } from "@/components/player/AmbientBackground";
import { PlayerProfileEditForm } from "@/components/player/profile/PlayerProfileEditForm";
import { SectionTitle } from "@/components/player/SectionTitle";
import { getPlayerProfileForEdit } from "@/lib/player-profile-service";
import { toPlayerProfileFormValues } from "@/lib/players/types";

export default async function PlayerProfileEditPage() {
  const { profile, fallbackName } = await getPlayerProfileForEdit();
  const initialValues = toPlayerProfileFormValues(profile, fallbackName);

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <AmbientBackground />

      <main className="relative z-10 px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
        <div className="mx-auto max-w-3xl space-y-10">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/player/profile"
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
              Back to Profile
            </Link>
          </div>

          <div>
            <SectionTitle
              title="Edit Profile"
              subtitle="Update your recruiting information and profile photo."
            />
          </div>

          <PlayerProfileEditForm initialValues={initialValues} />
        </div>
      </main>
    </div>
  );
}
