import { PlayerDocumentsClient } from "@/components/player/documents/PlayerDocumentsClient";

export default function PlayerDocumentsPage() {
  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="mb-6 text-sm text-zinc-500 sm:text-base">
          Upload transcripts, test scores, your resume, and a highlight video
          link. Files stay on this device for the MVP.
        </p>
        <PlayerDocumentsClient />
      </div>
    </div>
  );
}
