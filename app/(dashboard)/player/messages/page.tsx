import { MessagesClient } from "@/components/college/messages/MessagesClient";

export default function PlayerMessagesPage() {
  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1600px]">
        <MessagesClient viewerRole="player" />
      </div>
    </div>
  );
}
