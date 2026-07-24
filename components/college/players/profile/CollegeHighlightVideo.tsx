import { GlassCard } from "@/components/player/GlassCard";
import { SectionTitle } from "@/components/player/SectionTitle";
import { HighlightVideoEmbed } from "@/components/shared/HighlightVideoEmbed";
import { parseHighlightVideoUrl } from "@/lib/highlight-video";

type CollegeHighlightVideoProps = {
  url: string | null;
};

/** College-facing Highlight Video section with embed or fallback link. */
export function CollegeHighlightVideo({ url }: CollegeHighlightVideoProps) {
  const parsed = url ? parseHighlightVideoUrl(url) : null;

  return (
    <section aria-labelledby="college-highlight-video-heading">
      <SectionTitle title="Highlight Video" />
      <GlassCard className="mt-4 overflow-hidden p-0">
        {parsed ? (
          <>
            <HighlightVideoEmbed
              title={parsed.title}
              embedUrl={parsed.embedUrl}
              url={parsed.url}
              provider={parsed.provider}
            />
            <div className="p-5 sm:p-6">
              <p className="text-sm font-semibold text-white">{parsed.title}</p>
              <a
                href={parsed.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-emerald-400 hover:text-emerald-300"
              >
                Open on {parsed.provider === "youtube" ? "YouTube" : "Vimeo"} →
              </a>
            </div>
          </>
        ) : url ? (
          <div className="p-6 sm:p-8">
            <p className="mb-3 text-sm text-zinc-400">
              Preview unavailable for this link. Open the video directly:
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400 transition hover:border-emerald-500/50 hover:bg-emerald-500/20"
            >
              Open highlight video
            </a>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <p className="text-sm text-zinc-500">
              This player has not added a highlight video yet.
            </p>
          </div>
        )}
      </GlassCard>
    </section>
  );
}
