import { CollegeNotificationsClient } from "@/components/college/notifications/CollegeNotificationsClient";
import { requireApprovedCollege } from "@/lib/college-access";

export default async function CollegeNotificationsPage() {
  await requireApprovedCollege();

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="mb-6 text-sm text-zinc-500">
          Follow-up reminders, messages, and recruiting alerts.
        </p>
        <CollegeNotificationsClient />
      </div>
    </div>
  );
}
