"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { GlassCard } from "../GlassCard";
import {
  deleteDocumentAction,
  saveDocumentUrlAction,
} from "@/lib/player-documents/actions";
import {
  isValidHighlightVideoUrl,
  parseHighlightVideoUrl,
} from "@/lib/highlight-video";
import { type HighlightVideo } from "@/lib/player-profile";
import { HighlightVideoEmbed } from "@/components/shared/HighlightVideoEmbed";

type VideoGalleryProps = {
  videos: HighlightVideo[];
};

export function VideoGallery({ videos }: VideoGalleryProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const current = videos[0] ?? null;

  function openForm(replace = false) {
    setError(null);
    setUrlInput(replace && current ? current.url : "");
    setShowForm(true);
  }

  function handleSave() {
    const trimmed = urlInput.trim();
    if (!isValidHighlightVideoUrl(trimmed)) {
      setError("Enter a valid YouTube or Vimeo URL.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await saveDocumentUrlAction("highlight-video", trimmed);
      if (result.error) {
        setError(result.error);
        return;
      }
      setShowForm(false);
      setUrlInput("");
      router.refresh();
    });
  }

  function handleRemove() {
    setError(null);
    startTransition(async () => {
      const result = await deleteDocumentAction("highlight-video");
      if (result.error) {
        setError(result.error);
        return;
      }
      setShowForm(false);
      setUrlInput("");
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500">
          Add a YouTube or Vimeo highlight so college coaches can watch your game.
        </p>
        <button
          type="button"
          onClick={() => openForm(Boolean(current))}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-400 transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-500/20 disabled:opacity-60"
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
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          {current ? "Replace Video" : "Upload Video"}
        </button>
      </div>

      {showForm ? (
        <GlassCard className="mb-5 p-5 sm:p-6">
          <label
            htmlFor="highlight-video-url"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500"
          >
            YouTube or Vimeo URL
          </label>
          <input
            id="highlight-video-url"
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=… or https://vimeo.com/…"
            disabled={isPending}
            className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 disabled:opacity-60"
          />
          {urlInput.trim() && !parseHighlightVideoUrl(urlInput) ? (
            <p className="mt-2 text-xs text-amber-400/90">
              Only YouTube and Vimeo links are supported.
            </p>
          ) : null}
          {error ? (
            <p className="mt-2 text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {isPending ? "Saving…" : "Save Video"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError(null);
              }}
              disabled={isPending}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </GlassCard>
      ) : null}

      {!showForm && error ? (
        <p className="mb-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {current ? (
        <GlassCard className="overflow-hidden p-0">
          {current.embedUrl ? (
            <HighlightVideoEmbed
              title={current.title}
              embedUrl={current.embedUrl}
              url={current.url}
              provider={current.provider}
            />
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <h3 className="font-semibold tracking-tight text-white">
                {current.title}
              </h3>
              <a
                href={current.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs text-emerald-400 hover:text-emerald-300"
              >
                Open video →
              </a>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isPending}
              className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
            >
              {isPending ? "Removing…" : "Remove Video"}
            </button>
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="p-6 sm:p-8">
          <p className="text-sm text-zinc-500">
            No highlight video yet. Click Upload Video to add a YouTube or Vimeo
            link.
          </p>
        </GlassCard>
      )}
    </div>
  );
}
