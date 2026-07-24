import { CollegeDashboardClient } from "@/components/college/dashboard/CollegeDashboardClient";
import { getCollegeDashboardData } from "@/lib/college-dashboard-service";
import { getCurrentCollegeProfile } from "@/lib/college-profile-service";
import { getEmptyCollegeProfile } from "@/lib/college-profile";

export default async function CollegeDashboard() {
  let data: Awaited<ReturnType<typeof getCollegeDashboardData>> | null = null;
  let profile = getEmptyCollegeProfile();

  try {
    const [dashboard, collegeProfile] = await Promise.all([
      getCollegeDashboardData(),
      getCurrentCollegeProfile(),
    ]);
    data = dashboard;
    profile = collegeProfile;
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <div className="px-6 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/8 bg-white/[0.03] px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">
              Unable to load your dashboard right now.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <CollegeDashboardClient
        profile={profile}
        players={data.players}
        savedRecords={data.savedRecords}
        savedPlayersCount={data.savedPlayersCount}
        unreadMessages={data.unreadMessages}
        playersCount={data.playersCount}
      />
    </div>
  );
}
