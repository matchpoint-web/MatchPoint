import { MessagesClient } from "@/components/college/messages/MessagesClient";

type PageProps = {
  searchParams: Promise<{ c?: string }>;
};

export default async function CollegeMessagesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const conversationId =
    typeof params.c === "string" && params.c.trim() ? params.c.trim() : null;

  return (
    <div className="px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <p className="mb-4 text-sm text-zinc-500">
          Message players about recruiting opportunities.
        </p>
        <MessagesClient
          initialConversationId={conversationId}
          viewerRole="college"
        />
      </div>
    </div>
  );
}
