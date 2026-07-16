import { MessagesClient } from "@/components/college/messages/MessagesClient";

export default function CollegeMessagesPage() {
  return (
    <div className="px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <p className="mb-4 text-sm text-zinc-500">
          Message players about recruiting opportunities.
        </p>
        <MessagesClient />
      </div>
    </div>
  );
}
