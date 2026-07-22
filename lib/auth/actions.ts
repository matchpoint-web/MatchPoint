"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AuthActionState, UserRole } from "@/lib/auth/types";
import { homeForRole, loginPathForRole, getUserRole } from "@/lib/auth/utils";
import {
  ensureSessionProfile,
  isDuplicateSignupError,
  repairProfileAfterSignup,
} from "@/lib/auth/provision";
import {
  isPlayerAccountSuspended,
  SUSPENDED_ACCOUNT_PATH,
} from "@/lib/auth/suspended";
import { getAuthCallbackUrl } from "@/lib/auth/urls";
import { validateRedirect } from "@/lib/security/redirect";

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * When true (default), admin createUser marks email confirmed so Closed Beta
 * users can sign in immediately with app_metadata.role on the JWT.
 * Set SUPABASE_SIGNUP_AUTO_CONFIRM=false to require email confirmation;
 * we then resend the signup confirmation email after createUser.
 */
function signupAutoConfirm(): boolean {
  return process.env.SUPABASE_SIGNUP_AUTO_CONFIRM !== "false";
}

export async function signUp(
  role: UserRole,
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  // Admins are never created via application signup.
  if (role === "admin") {
    return { error: "Admin accounts cannot be created through signup." };
  }

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
      if (isDuplicateSignupError(createError.message)) {
        return {
          error:
            "An account with this email already exists. Please log in instead.",
        };
      }
      return { error: createError.message };
    }

    if (!created.user) {
      return { error: "Failed to create account." };
    }

    // Triggers usually provision the profile; repair if missing (idempotent).
    // If repair fails, login/callback ensureSessionProfile still recovers.
    try {
      await repairProfileAfterSignup({
        userId: created.user.id,
        role,
        fullName: role === "player" ? fullName : undefined,
        schoolName: role === "college" ? schoolName : undefined,
      });
    } catch {
      // Continue — profile can be ensured on first authenticated session.
    }

    if (!autoConfirm) {
      const supabase = await createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: getAuthCallbackUrl(),
        },
      });

      if (resendError) {
        return {
          error: null,
          success:
            "Account created, but we could not send the confirmation email. Try logging in later or use “resend confirmation” from Supabase Auth if configured. Contact support if this continues.",
        };
      }

      return {
        error: null,
        success:
          "Account created. Check your email to confirm, then log in.",
      };
    }

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

    const sessionRole = getUserRole(signedIn.user);
    if (sessionRole !== role) {
      await supabase.auth.signOut();
      return {
        error:
          "Account was created but role provisioning failed. Please contact support.",
      };
    }

    await ensureSessionProfile(role);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create account.";
    if (isDuplicateSignupError(message)) {
      return {
        error:
          "An account with this email already exists. Please log in instead.",
      };
    }
    return { error: message };
  }

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

  if (userRole === "player" || userRole === "college") {
    try {
      await ensureSessionProfile(userRole);
    } catch (ensureError) {
      await supabase.auth.signOut();
      return {
        error:
          ensureError instanceof Error
            ? ensureError.message
            : "Could not load your profile. Please try again.",
      };
    }
  }

  // Suspended players keep their session and land on a dedicated screen.
  if (userRole === "player") {
    const suspended = await isPlayerAccountSuspended(data.user.id);
    if (suspended) {
      redirect(SUSPENDED_ACCOUNT_PATH);
    }
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

  const userRole = getUserRole(user);

  if (role) {
    if (userRole !== role) {
      redirect(
        userRole === "college" ||
          userRole === "player" ||
          userRole === "admin"
          ? homeForRole(userRole)
          : loginPathForRole(role),
      );
    }
  }

  // Mid-session suspension: keep session, block portal access.
  if (userRole === "player") {
    const suspended = await isPlayerAccountSuspended(user.id);
    if (suspended) {
      redirect(SUSPENDED_ACCOUNT_PATH);
    }
  }

  return user;
}

export async function requirePlayer() {
  return requireUser("player");
}

export async function requireCollege() {
  return requireUser("college");
}

export async function requireAdmin() {
  return requireUser("admin");
}
