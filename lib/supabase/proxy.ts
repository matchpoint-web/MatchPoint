import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";
import { getUserRole, homeForRole } from "@/lib/auth/utils";
import { SUSPENDED_ACCOUNT_PATH } from "@/lib/auth/suspended";
import { validateRedirect } from "@/lib/security/redirect";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const role = getUserRole(user);

  const isPlayerRoute =
    pathname === "/player" || pathname.startsWith("/player/");
  const isCollegeRoute =
    pathname === "/college" || pathname.startsWith("/college/");
  const isAdminRoute =
    pathname === "/admin" || pathname.startsWith("/admin/");
  const isAccountRoute =
    pathname === "/account" || pathname.startsWith("/account/");
  const isSuspendedRoute = pathname === SUSPENDED_ACCOUNT_PATH;
  const isAuthRoute = pathname.startsWith("/auth/");

  if (
    (isPlayerRoute || isCollegeRoute || isAdminRoute || isAccountRoute) &&
    !user
  ) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = isAdminRoute
      ? "/auth/admin/login"
      : isCollegeRoute
        ? "/auth/college/login"
        : "/auth/player/login";
    loginUrl.search = "";
    const fallback = isAdminRoute
      ? "/admin/dashboard"
      : isCollegeRoute
        ? "/college/dashboard"
        : isAccountRoute
          ? SUSPENDED_ACCOUNT_PATH
          : "/player";
    const returnTo = validateRedirect(
      `${pathname}${request.nextUrl.search}`,
      fallback,
    );
    loginUrl.searchParams.set("next", returnTo);
    return NextResponse.redirect(loginUrl);
  }

  // Suspended screen is player-only; other roles go to their portal home.
  if (isSuspendedRoute && user && role !== "player") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = role ? homeForRole(role) : "/";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (isPlayerRoute && user && role !== "player") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = role ? homeForRole(role) : "/auth/player/login";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (isCollegeRoute && user && role !== "college") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = role ? homeForRole(role) : "/auth/college/login";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (isAdminRoute && user && role !== "admin") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = role ? homeForRole(role) : "/auth/admin/login";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && user && role && pathname !== "/auth/callback") {
    const redirectUrl = request.nextUrl.clone();
    // Suspended players are sent to the dedicated screen after any auth page hit.
    if (role === "player") {
      const { data } = await supabase
        .from("players")
        .select("account_status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.account_status === "SUSPENDED") {
        redirectUrl.pathname = SUSPENDED_ACCOUNT_PATH;
        redirectUrl.search = "";
        return NextResponse.redirect(redirectUrl);
      }
    }

    redirectUrl.pathname = homeForRole(role);
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
