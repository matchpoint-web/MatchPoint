"use client";

import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { GlassCard } from "@/components/player/GlassCard";
import {
  type DocumentDefinition,
  type UploadedDocument,
  isValidHttpUrl,
} from "@/lib/player-documents";

type DocumentCardProps = {
  definition: DocumentDefinition;
  uploaded: UploadedDocument | null;
  onUploadFile: (file: File) => void;
  onUploadUrl: (url: string) => void;
  onRemove: () => void;
};

export function DocumentCard({
  definition,
  uploaded,
  onUploadFile,
  onUploadUrl,
  onRemove,
}: DocumentCardProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = useState(uploaded?.url ?? "");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [showUrlForm, setShowUrlForm] = useState(false);

  const isUploaded = Boolean(uploaded);
  const isUrlKind = definition.kind === "url";

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    onUploadFile(file);
  }

  function handleUrlSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = urlDraft.trim();
    if (!isValidHttpUrl(trimmed)) {
      setUrlError("Enter a valid http(s) URL.");
      return;
    }
    setUrlError(null);
    onUploadUrl(trimmed);
    setShowUrlForm(false);
  }

  function handlePrimaryAction() {
    if (isUrlKind) {
      setUrlDraft(uploaded?.url ?? "");
      setUrlError(null);
      setShowUrlForm(true);
      return;
    }
    openFilePicker();
  }

  return (
    <GlassCard hover className="flex h-full flex-col p-6 sm:p-7">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-white">
            {definition.title}
          </h3>
          {definition.optional ? (
            <span className="mt-1 inline-block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Optional
            </span>
          ) : null}
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isUploaded
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-white/5 text-zinc-500"
          }`}
        >
          {isUploaded ? "Uploaded" : "Not uploaded"}
        </span>
      </div>

      <p className="mb-5 text-sm leading-relaxed text-zinc-500">
        {definition.description}
      </p>

      {isUploaded && uploaded ? (
        <div className="mb-5 rounded-2xl border border-white/8 bg-white/[0.03] px-3.5 py-3">
          {uploaded.fileName ? (
            <p className="truncate text-sm text-zinc-300">{uploaded.fileName}</p>
          ) : null}
          {uploaded.url ? (
            <a
              href={uploaded.url}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-sm text-emerald-400 hover:text-emerald-300"
            >
              {uploaded.url}
            </a>
          ) : null}
          <p className="mt-1 text-xs text-zinc-600">
            Added{" "}
            {new Date(uploaded.uploadedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      ) : null}

      {isUrlKind && showUrlForm ? (
        <form onSubmit={handleUrlSubmit} className="mb-4 space-y-3">
          <label htmlFor={inputId} className="sr-only">
            Highlight video URL
          </label>
          <input
            id={inputId}
            type="url"
            value={urlDraft}
            onChange={(event) => {
              setUrlDraft(event.target.value);
              if (urlError) setUrlError(null);
            }}
            placeholder="https://..."
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-500/40"
          />
          {urlError ? (
            <p className="text-xs text-red-400">{urlError}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400 sm:flex-none"
            >
              Save URL
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUrlForm(false);
                setUrlError(null);
              }}
              className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 sm:flex-none"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {!isUrlKind ? (
        <input
          ref={fileInputRef}
          type="file"
          accept={definition.accept}
          className="hidden"
          onChange={handleFileChange}
        />
      ) : null}

      <div className="mt-auto flex flex-col gap-2 sm:flex-row">
        {!showUrlForm ? (
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400 transition hover:border-emerald-500/50 hover:bg-emerald-500/20"
          >
            <UploadIcon />
            {isUploaded ? "Replace" : "Upload"}
          </button>
        ) : null}

        {isUploaded ? (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 sm:flex-none sm:px-5"
          >
            Remove
          </button>
        ) : null}
      </div>
    </GlassCard>
  );
}

function UploadIcon() {
  return (
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
  );
}
