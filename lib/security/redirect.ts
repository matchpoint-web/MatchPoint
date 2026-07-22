/**
 * Open-redirect protection for MatchPoint.
 * Only same-origin relative paths are allowed as redirect destinations.
 */

const DANGEROUS_SCHEME = /^(javascript|data|vbscript|file|blob):/i;

/**
 * Returns true when `path` is a safe relative MatchPoint path
 * (starts with a single `/`, no protocol-relative or absolute URL).
 */
export function isSafeInternalPath(path: string): boolean {
  if (typeof path !== "string") return false;

  const trimmed = path.trim();
  if (!trimmed) return false;

  // Must be a path-absolute relative URL (not protocol-relative).
  if (!trimmed.startsWith("/")) return false;
  if (trimmed.startsWith("//")) return false;
  if (trimmed.includes("\\")) return false;

  // Reject ASCII control characters before decoding.
  if (/[\u0000-\u001f\u007f]/.test(trimmed)) return false;

  let decoded = trimmed;
  try {
    // Decode a few times to catch double/triple-encoded attacks.
    for (let i = 0; i < 5; i++) {
      const next = decodeURIComponent(decoded.replace(/\+/g, " "));
      if (next === decoded) break;
      decoded = next;
    }
  } catch {
    return false;
  }

  const normalized = decoded.trim();
  if (!normalized.startsWith("/")) return false;
  if (normalized.startsWith("//")) return false;
  if (normalized.includes("\\")) return false;
  if (/[\u0000-\u001f\u007f]/.test(normalized)) return false;

  // Whitespace between slashes can still form protocol-relative URLs in some agents.
  if (/^\/[\s\u0000-\u001f]*\//.test(normalized)) return false;

  const lower = normalized.toLowerCase();
  if (lower.includes("://")) return false;
  if (DANGEROUS_SCHEME.test(lower.replace(/^\/+/, ""))) return false;

  // Reject "/http://…" and "/https://…" style tricks after decode.
  if (/^\/\s*https?:/i.test(normalized)) return false;

  return true;
}

/**
 * Validate a user-controlled redirect destination.
 * Returns `redirectTo` when safe; otherwise `fallback` (also validated).
 */
export function validateRedirect(
  redirectTo: string | null | undefined,
  fallback: string,
): string {
  const safeFallback = isSafeInternalPath(fallback) ? fallback.trim() : "/";

  if (redirectTo == null) return safeFallback;

  const candidate =
    typeof redirectTo === "string" ? redirectTo.trim() : String(redirectTo).trim();

  if (!candidate) return safeFallback;
  if (!isSafeInternalPath(candidate)) return safeFallback;

  return candidate;
}

/**
 * Return a sanitized redirect param for hidden form fields / links,
 * or `null` when the value must be omitted.
 */
export function sanitizeRedirectParam(
  redirectTo: string | null | undefined,
): string | null {
  if (redirectTo == null) return null;
  const trimmed = typeof redirectTo === "string" ? redirectTo.trim() : "";
  if (!trimmed) return null;
  return isSafeInternalPath(trimmed) ? trimmed : null;
}
