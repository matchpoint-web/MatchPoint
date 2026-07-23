import { MessagesClient } from "@/components/college/messages/MessagesClient";

type PageProps = {
  searchParams: Promise<{ c?: string }>;
};

export default async function PlayerMessagesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const conversationId =
    typeof params.c === "string" && params.c.trim() ? params.c.trim() : null;

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1600px]">
        <MessagesClient
          initialConversationId={conversationId}
          viewerRole="player"
        />
      </div>
    </div>
  );
}
