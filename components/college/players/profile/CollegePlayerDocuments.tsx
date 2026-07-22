"use client";

import { useCallback, useState, useTransition } from "react";
import { GlassCard } from "@/components/player/GlassCard";
import { SectionTitle } from "@/components/player/SectionTitle";
import { getPlayerDocumentsForCollegeAction } from "@/lib/player-documents/college-actions";
import {
  DOCUMENT_DEFINITIONS,
  type PlayerDocumentsState,
  type UploadedDocument,
} from "@/lib/player-documents";

type CollegePlayerDocumentsProps = {
  playerId: string;
  initialDocuments: PlayerDocumentsState | null;
  initialError: string | null;
};

export function CollegePlayerDocuments({
  playerId,
  initialDocuments,
  initialError,
}: CollegePlayerDocumentsProps) {
  const [documents, setDocuments] = useState<PlayerDocumentsState | null>(
    initialDocuments,
  );
  const [error, setError] = useState<string | null>(initialError);
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      const result = await getPlayerDocumentsForCollegeAction(playerId);
      if (result.error || !result.documents) {
        setError(result.error ?? "Failed to load documents.");
        return;
      }
      setError(null);
      setDocuments(result.documents);
    });
  }, [playerId]);

  const entries = DOCUMENT_DEFINITIONS.map((def) => ({
    definition: def,
    uploaded: documents?.[def.id] ?? null,
  }));

  const uploadedCount = entries.filter((e) => e.uploaded).length;

  return (
    <section aria-labelledby="college-player-documents-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <SectionTitle title="Documents" />
        <button
          type="button"
          onClick={refresh}
          disabled={isPending}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-white/10 disabled:opacity-60"
        >
          {isPending ? "Refreshing…" : "Refresh links"}
        </button>
      </div>

      {error ? (
        <GlassCard className="p-6 sm:p-8">
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
          <button
            type="button"
            onClick={refresh}
            disabled={isPending}
            className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 disabled:opacity-60"
          >
            Try again
          </button>
        </GlassCard>
      ) : null}

      {!error && documents && uploadedCount === 0 ? (
        <GlassCard className="p-6 sm:p-8">
          <p className="text-sm text-zinc-500">
            This player has not uploaded any documents yet.
          </p>
        </GlassCard>
      ) : null}

      {!error && documents && uploadedCount > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {entries.map(({ definition, uploaded }) => {
            if (!uploaded) return null;
            return (
              <li key={definition.id}>
                <DocumentViewCard
                  title={definition.title}
                  description={definition.description}
                  kind={definition.kind}
                  document={uploaded}
                />
              </li>
            );
          })}
        </ul>
      ) : null}

      {!error && !documents && isPending ? (
        <GlassCard className="p-6 sm:p-8">
          <p className="text-sm text-zinc-500">Loading documents…</p>
        </GlassCard>
      ) : null}
    </section>
  );
}

function DocumentViewCard({
  title,
  description,
  kind,
  document,
}: {
  title: string;
  description: string;
  kind: "file" | "url";
  document: UploadedDocument;
}) {
  const label =
    kind === "url"
      ? "Open video"
      : document.fileName
        ? "View document"
        : "Open";

  return (
    <GlassCard className="flex h-full flex-col p-5 sm:p-6">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3
          id={`doc-${document.id}`}
          className="text-base font-semibold tracking-tight text-white"
        >
          {title}
        </h3>
        <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
          Available
        </span>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-zinc-500">{description}</p>

      {document.fileName ? (
        <p className="mb-2 truncate text-sm text-zinc-300">{document.fileName}</p>
      ) : null}

      <p className="mb-4 text-xs text-zinc-600">
        Added{" "}
        {new Date(document.uploadedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>

      <div className="mt-auto">
        {document.url ? (
          <a
            href={document.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400 transition hover:border-emerald-500/50 hover:bg-emerald-500/20"
          >
            {label}
          </a>
        ) : (
          <p className="text-sm text-amber-400/90" role="status">
            File recorded but preview is unavailable. Try Refresh links.
          </p>
        )}
      </div>
    </GlassCard>
  );
}
