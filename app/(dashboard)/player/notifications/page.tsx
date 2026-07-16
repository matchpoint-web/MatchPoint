import { PlayerNotificationsClient } from "@/components/player/notifications/PlayerNotificationsClient";

export default function PlayerNotificationsPage() {
  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="mb-6 text-sm text-zinc-500 sm:text-base">
          Profile views, college saves, messages, and reminders.
        </p>
        <PlayerNotificationsClient />
      </div>
    </div>
  );
}
