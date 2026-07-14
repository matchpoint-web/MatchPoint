import { AuthForm } from "@/components/auth/AuthForm";
import { signIn } from "@/lib/auth/actions";
import type { AuthActionState } from "@/lib/auth/types";

async function collegeSignIn(
  prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  "use server";
  return signIn("college", prevState, formData);
}

export default async function CollegeLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex justify-center">
      <AuthForm
        role="college"
        mode="login"
        action={collegeSignIn}
        next={params.next}
      />
    </div>
  );
}
