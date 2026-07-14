import { AuthForm } from "@/components/auth/AuthForm";
import { signUp } from "@/lib/auth/actions";
import type { AuthActionState } from "@/lib/auth/types";

async function playerSignUp(
  prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  "use server";
  return signUp("player", prevState, formData);
}

export default function PlayerSignupPage() {
  return (
    <div className="mx-auto flex justify-center">
      <AuthForm role="player" mode="signup" action={playerSignUp} />
    </div>
  );
}
