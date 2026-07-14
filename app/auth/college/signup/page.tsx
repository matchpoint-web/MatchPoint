import { AuthForm } from "@/components/auth/AuthForm";
import { signUp } from "@/lib/auth/actions";
import type { AuthActionState } from "@/lib/auth/types";

async function collegeSignUp(
  prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  "use server";
  return signUp("college", prevState, formData);
}

export default function CollegeSignupPage() {
  return (
    <div className="mx-auto flex justify-center">
      <AuthForm role="college" mode="signup" action={collegeSignUp} />
    </div>
  );
}
