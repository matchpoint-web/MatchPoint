import { AuthForm } from "@/components/auth/AuthForm";
import { signIn } from "@/lib/auth/actions";
import type { AuthActionState } from "@/lib/auth/types";
import { sanitizeRedirectParam } from "@/lib/security/redirect";

async function playerSignIn(
  prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  "use server";
  return signIn("player", prevState, formData);
}

export default async function PlayerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = sanitizeRedirectParam(params.next ?? null);

  return (
    <div className="mx-auto flex justify-center">
      <AuthForm
        role="player"
        mode="login"
        action={playerSignIn}
        next={next}
      />
    </div>
  );
}
