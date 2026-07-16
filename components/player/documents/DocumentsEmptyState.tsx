type DocumentsEmptyStateProps = {
  onBrowse?: () => void;
};

export function DocumentsEmptyState({ onBrowse }: DocumentsEmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center sm:py-14">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-400">
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold tracking-tight text-white">
        No documents uploaded
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-500">
        Upload your transcript, test scores, resume, and highlight video so
        college coaches can review your profile.
      </p>
      {onBrowse ? (
        <button
          type="button"
          onClick={onBrowse}
          className="mt-7 inline-flex rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
        >
          Start uploading
        </button>
      ) : null}
    </div>
  );
}
