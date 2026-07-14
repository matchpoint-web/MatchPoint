import { type HighlightVideo } from "@/lib/player-profile";
import { GlassCard } from "../GlassCard";

type VideoGalleryProps = {
  videos: HighlightVideo[];
};

export function VideoGallery({ videos }: VideoGalleryProps) {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div />
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-400 transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-500/20"
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
          Upload Video
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {videos.map((video) => (
          <GlassCard key={video.id} hover className="group">
            <div className="relative aspect-video overflow-hidden rounded-t-3xl bg-gradient-to-br from-zinc-800 to-zinc-900">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.12)_0%,_transparent_70%)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  aria-label={`Play ${video.title}`}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/20"
                >
                  <svg
                    className="ml-0.5 h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
              <span className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-zinc-300 backdrop-blur-sm">
                {video.duration}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-semibold tracking-tight text-white">
                {video.title}
              </h3>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
