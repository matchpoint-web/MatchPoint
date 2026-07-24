/**
 * Highlight video URL helpers (YouTube / Vimeo).
 * Persistence reuses player_documents (document_type = highlight_video).
 */

export type HighlightVideoProvider = "youtube" | "vimeo";

export type ParsedHighlightVideo = {
  url: string;
  provider: HighlightVideoProvider;
  embedUrl: string;
  title: string;
};

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);

function normalizeHost(hostname: string): string {
  return hostname.trim().toLowerCase();
}

function youtubeIdFromUrl(url: URL): string | null {
  const host = normalizeHost(url.hostname);
  if (host === "youtu.be" || host === "www.youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
    return id || null;
  }
  if (YOUTUBE_HOSTS.has(host)) {
    if (url.pathname.startsWith("/embed/")) {
      const id = url.pathname.split("/")[2] ?? "";
      return id || null;
    }
    if (url.pathname.startsWith("/shorts/")) {
      const id = url.pathname.split("/")[2] ?? "";
      return id || null;
    }
    const v = url.searchParams.get("v");
    return v?.trim() || null;
  }
  return null;
}

function vimeoIdFromUrl(url: URL): string | null {
  const host = normalizeHost(url.hostname);
  if (!VIMEO_HOSTS.has(host)) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  if (host === "player.vimeo.com" && parts[0] === "video") {
    return parts[1] || null;
  }
  const id = parts.find((part) => /^\d+$/.test(part));
  return id ?? null;
}

/** True when the URL is a supported YouTube or Vimeo highlight link. */
export function isValidHighlightVideoUrl(value: string): boolean {
  return parseHighlightVideoUrl(value) != null;
}

/** Parse a YouTube/Vimeo URL into embed metadata, or null if invalid. */
export function parseHighlightVideoUrl(
  value: string,
): ParsedHighlightVideo | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }

  const youtubeId = youtubeIdFromUrl(url);
  if (youtubeId) {
    return {
      url: trimmed,
      provider: "youtube",
      embedUrl: `https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}`,
      title: "Highlight Video (YouTube)",
    };
  }

  const vimeoId = vimeoIdFromUrl(url);
  if (vimeoId) {
    return {
      url: trimmed,
      provider: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${encodeURIComponent(vimeoId)}`,
      title: "Highlight Video (Vimeo)",
    };
  }

  return null;
}
