import { AuthForm } from "@/components/auth/AuthForm";
import { signIn } from "@/lib/auth/actions";
import type { AuthActionState } from "@/lib/auth/types";
import { sanitizeRedirectParam } from "@/lib/security/redirect";

async function adminSignIn(
  prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  "use server";
  return signIn("admin", prevState, formData);
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = sanitizeRedirectParam(params.next ?? null);

  return (
    <div className="mx-auto flex justify-center">
      <AuthForm
        role="admin"
        mode="login"
        action={adminSignIn}
        next={next}
      />
    </div>
  );
}
