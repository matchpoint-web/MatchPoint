import { type DocumentItem } from "@/lib/player-profile";
import { GlassCard } from "../GlassCard";

type DocumentsSectionProps = {
  documents: DocumentItem[];
};

export function DocumentsSection({ documents }: DocumentsSectionProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {documents.map((doc) => (
        <GlassCard key={doc.id} hover className="flex flex-col p-6 sm:p-7">
          <h3 className="mb-3 text-lg font-semibold tracking-tight text-white">
            {doc.name}
          </h3>

          <p
            className={`mb-6 text-sm font-medium ${
              doc.status === "uploaded" ? "text-emerald-400" : "text-zinc-500"
            }`}
          >
            {doc.status === "uploaded" ? "Uploaded" : "Not uploaded"}
          </p>

          <button
            type="button"
            className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400 transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-500/20"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            Upload
          </button>
        </GlassCard>
      ))}
    </div>
  );
}
