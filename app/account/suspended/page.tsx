import { redirect } from "next/navigation";
import { SuspendedAccountSignOutButton } from "@/components/account/SuspendedAccountSignOutButton";
import { createClient } from "@/lib/supabase/server";
import { getUserRole, homeForRole, loginPathForRole } from "@/lib/auth/utils";
import { isPlayerAccountSuspended } from "@/lib/auth/suspended";

export default async function SuspendedAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(loginPathForRole("player"));
  }

  const role = getUserRole(user);

  // Dedicated suspended screen is for players only.
  if (role !== "player") {
    redirect(role ? homeForRole(role) : "/");
  }

  const suspended = await isPlayerAccountSuspended(user.id);
  if (!suspended) {
    redirect(homeForRole("player"));
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-16 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-amber-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-emerald-400/80">
          MatchPoint
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Account suspended
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          Your MatchPoint account has been suspended. If you believe this is a
          mistake, please contact MatchPoint.
        </p>
        <div className="mt-8">
          <SuspendedAccountSignOutButton />
        </div>
      </div>
    </div>
  );
}
