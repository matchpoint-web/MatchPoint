import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRole, homeForRole } from "@/lib/auth/utils";
import {
  isPlayerAccountSuspended,
  SUSPENDED_ACCOUNT_PATH,
} from "@/lib/auth/suspended";
import { validateRedirect } from "@/lib/security/redirect";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const role = getUserRole(data.user);

      if (role === "player" && data.user) {
        const suspended = await isPlayerAccountSuspended(data.user.id);
        if (suspended) {
          return NextResponse.redirect(
            new URL(SUSPENDED_ACCOUNT_PATH, origin),
          );
        }
      }

      const fallback = role ? homeForRole(role) : "/";
      const destination = validateRedirect(next, fallback);
      return NextResponse.redirect(new URL(destination, origin));
    }
  }

  return NextResponse.redirect(new URL("/auth/player/login", origin));
}
