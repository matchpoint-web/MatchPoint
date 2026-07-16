import { CollegeSettingsForm } from "@/components/college/settings/CollegeSettingsForm";
import { getCurrentCollegeProfile } from "@/lib/college-profile-service";

export default async function CollegeSettingsPage() {
  const initialProfile = await getCurrentCollegeProfile();

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="mb-6 text-sm text-zinc-500 sm:text-base">
          Edit your university profile for recruiting.
        </p>
        <CollegeSettingsForm initialProfile={initialProfile} />
      </div>
    </div>
  );
}
