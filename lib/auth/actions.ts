"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AuthActionState, UserRole } from "@/lib/auth/types";
import { homeForRole, loginPathForRole, getUserRole } from "@/lib/auth/utils";
import { validateRedirect } from "@/lib/security/redirect";

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * When true (default), admin createUser marks email confirmed so Closed Beta
 * users can sign in immediately with app_metadata.role on the JWT.
 * Set SUPABASE_SIGNUP_AUTO_CONFIRM=false to require email confirmation;
 * we then attempt auth.resend({ type: "signup" }) after createUser.
 */
function signupAutoConfirm(): boolean {
  return process.env.SUPABASE_SIGNUP_AUTO_CONFIRM !== "false";
}

export async function signUp(
  role: UserRole,
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const fullName = getString(formData, "full_name");
  const schoolName = getString(formData, "school_name");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  if (role === "player" && !fullName) {
    return { error: "Full name is required." };
  }

  if (role === "college" && !schoolName) {
    return { error: "School name is required." };
  }

  try {
    const admin = createAdminClient();
    const autoConfirm = signupAutoConfirm();

    // Production pattern: set immutable role in app_metadata at create time.
    // Never put role in user_metadata (clients can modify that).
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: autoConfirm,
        app_metadata: { role },
        user_metadata:
          role === "player"
            ? { full_name: fullName }
            : { school_name: schoolName },
      });

    if (createError) {
      return { error: createError.message };
    }

    if (!created.user) {
      return { error: "Failed to create account." };
    }

    // Signup triggers provision players/colleges from app_metadata.role.

    if (!autoConfirm) {
      // Best-effort confirmation email (createUser does not always send one).
      const supabase = await createClient();
      await supabase.auth.resend({ type: "signup", email });
      return {
        error: null,
        success:
          "Account created. Check your email to confirm, then log in.",
      };
    }

    // Establish a cookie session with the anon/server client (not service role).
    const supabase = await createClient();
    const { data: signedIn, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !signedIn.session) {
      return {
        error: null,
        success:
          "Account created. Please log in with your email and password.",
      };
    }

    // Defense in depth: JWT must carry the immutable role we just set.
    const sessionRole = getUserRole(signedIn.user);
    if (sessionRole !== role) {
      await supabase.auth.signOut();
      return {
        error:
          "Account was created but role provisioning failed. Please contact support.",
      };
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create account.";
    return { error: message };
  }

  // redirect() must stay outside try/catch — it throws a Next.js control flow signal.
  redirect(homeForRole(role));
}

export async function signIn(
  role: UserRole,
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const next = getString(formData, "next");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const userRole = getUserRole(data.user);
  if (userRole && userRole !== role) {
    await supabase.auth.signOut();
    return {
      error: `This account is registered as a ${userRole}. Please use the ${userRole} login.`,
    };
  }

  if (!userRole) {
    await supabase.auth.signOut();
    return {
      error:
        "This account has no portal role assigned. Please contact support.",
    };
  }

  const home = homeForRole(role);
  redirect(validateRedirect(next || null, home));
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requireUser(role?: UserRole) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(role ? loginPathForRole(role) : "/");
  }

  if (role) {
    const userRole = getUserRole(user);
    if (userRole !== role) {
      redirect(
        userRole === "college" || userRole === "player"
          ? homeForRole(userRole)
          : loginPathForRole(role),
      );
    }
  }

  return user;
}
