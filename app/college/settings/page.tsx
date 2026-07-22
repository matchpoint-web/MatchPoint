import { AccountStatusBadge } from "@/components/admin/AccountStatusBadge";
import { CollegeSettingsForm } from "@/components/college/settings/CollegeSettingsForm";
import { GlassCard } from "@/components/player/GlassCard";
import { getCurrentCollegeAccountStatus } from "@/lib/college-access";
import { getCurrentCollegeProfile } from "@/lib/college-profile-service";

export default async function CollegeSettingsPage() {
  const [initialProfile, accountStatus] = await Promise.all([
    getCurrentCollegeProfile(),
    getCurrentCollegeAccountStatus(),
  ]);

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <p className="text-sm text-zinc-500 sm:text-base">
          Edit your university profile for recruiting.
        </p>

        {accountStatus ? (
          <GlassCard className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Account status
              </p>
              <p className="mt-1 text-sm text-zinc-300">
                {accountStatus === "APPROVED"
                  ? "Your program can search and message players."
                  : accountStatus === "PENDING"
                    ? "Waiting for MatchPoint approval before recruiting unlocks."
                    : "Recruiting access is currently unavailable."}
              </p>
            </div>
            <AccountStatusBadge status={accountStatus} />
          </GlassCard>
        ) : null}

        <CollegeSettingsForm initialProfile={initialProfile} />
      </div>
    </div>
  );
}
