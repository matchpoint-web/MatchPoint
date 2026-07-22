import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/player",
    "/player/:path*",
    "/college",
    "/college/:path*",
    "/admin",
    "/admin/:path*",
    "/account",
    "/account/:path*",
    "/auth/:path*",
  ],
};
