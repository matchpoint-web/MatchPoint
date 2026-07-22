import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";
import { getUserRole, homeForRole } from "@/lib/auth/utils";
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
  const isAuthRoute = pathname.startsWith("/auth/");

  if ((isPlayerRoute || isCollegeRoute) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = isCollegeRoute
      ? "/auth/college/login"
      : "/auth/player/login";
    loginUrl.search = "";
    const fallback = isCollegeRoute ? "/college/dashboard" : "/player";
    const returnTo = validateRedirect(
      `${pathname}${request.nextUrl.search}`,
      fallback,
    );
    loginUrl.searchParams.set("next", returnTo);
    return NextResponse.redirect(loginUrl);
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

  if (isAuthRoute && user && role && pathname !== "/auth/callback") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = homeForRole(role);
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
