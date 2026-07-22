/**
 * Auth email redirect target for confirmation links.
 * Configure NEXT_PUBLIC_SITE_URL in production (e.g. https://matchpoint.example).
 */
export function getAuthCallbackUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return `${configured.replace(/\/$/, "")}/auth/callback`;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${host}/auth/callback`;
  }

  return "http://localhost:3000/auth/callback";
}
