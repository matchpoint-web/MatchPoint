import { GlassCard } from "@/components/player/GlassCard";

type HighlightVideoEmbedProps = {
  title: string;
  embedUrl: string;
  url: string;
  provider: "youtube" | "vimeo";
};

/** Shared YouTube/Vimeo iframe embed for player and college profiles. */
export function HighlightVideoEmbed({
  title,
  embedUrl,
  url,
  provider,
}: HighlightVideoEmbedProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
      <iframe
        title={title}
        src={embedUrl}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <noscript>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-sm text-emerald-400"
        >
          Open {provider === "youtube" ? "YouTube" : "Vimeo"} video
        </a>
      </noscript>
    </div>
  );
}
