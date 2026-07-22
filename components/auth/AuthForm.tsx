"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthActionState, UserRole } from "@/lib/auth/types";
import { INITIAL_AUTH_STATE } from "@/lib/auth/types";
import {
  loginPathForRole,
  signupPathForRole,
} from "@/lib/auth/utils";
import { sanitizeRedirectParam } from "@/lib/security/redirect";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  role: UserRole;
  mode: AuthMode;
  action: (
    prevState: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  next?: string | null;
};

export function AuthForm({ role, mode, action, next }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    INITIAL_AUTH_STATE,
  );
  const safeNext = sanitizeRedirectParam(next ?? null);

  const isPlayer = role === "player";
  const isCollege = role === "college";
  const isAdmin = role === "admin";

  // Admin accounts are provisioned by the platform owner only — never signup.
  const effectiveMode: AuthMode = isAdmin ? "login" : mode;

  const portalLabel = isAdmin
    ? "Admin Portal"
    : isPlayer
      ? "Player Portal"
      : "College Portal";

  const title =
    effectiveMode === "login"
      ? isAdmin
        ? "Admin Login"
        : isPlayer
          ? "Player Login"
          : "College Login"
      : isPlayer
        ? "Player Sign Up"
        : "College Sign Up";

  const subtitle =
    effectiveMode === "login"
      ? isAdmin
        ? "MatchPoint operator access."
        : "Welcome back to MatchPoint."
      : isPlayer
        ? "Create your player recruiting account."
        : "Create your college recruiting account. Approval is required before recruiting features unlock.";

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-emerald-400/80">
          {portalLabel}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          {title}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
      </div>

      <form action={formAction} className="space-y-4">
        {safeNext ? (
          <input type="hidden" name="next" value={safeNext} />
        ) : null}

        {effectiveMode === "signup" && isPlayer ? (
          <div>
            <label
              htmlFor="full_name"
              className="mb-1.5 block text-sm text-zinc-400"
            >
              Full name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              autoComplete="name"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/30"
              placeholder="Alex Tanaka"
            />
          </div>
        ) : null}

        {effectiveMode === "signup" && isCollege ? (
          <div>
            <label
              htmlFor="school_name"
              className="mb-1.5 block text-sm text-zinc-400"
            >
              School name
            </label>
            <input
              id="school_name"
              name="school_name"
              type="text"
              required
              autoComplete="organization"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/30"
              placeholder="Stanford University"
            />
          </div>
        ) : null}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm text-zinc-400">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/30"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm text-zinc-400"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={
              effectiveMode === "login" ? "current-password" : "new-password"
            }
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/30"
            placeholder="••••••••"
          />
        </div>

        {state.error ? (
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {state.error}
          </p>
        ) : null}

        {state.success ? (
          <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {state.success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending
            ? "Please wait…"
            : effectiveMode === "login"
              ? "Log in"
              : "Create account"}
        </button>
      </form>

      <div className="mt-6 space-y-3 text-center text-sm">
        {!isAdmin ? (
          <>
            <Link
              href={
                effectiveMode === "login"
                  ? signupPathForRole(role === "college" ? "college" : "player")
                  : loginPathForRole(role === "college" ? "college" : "player")
              }
              className="block text-zinc-400 transition hover:text-white"
            >
              {effectiveMode === "login"
                ? "Need an account? Sign up"
                : "Already have an account? Log in"}
            </Link>
            <Link
              href={
                isPlayer ? "/auth/college/login" : "/auth/player/login"
              }
              className="block text-zinc-600 transition hover:text-zinc-400"
            >
              {isPlayer ? "College login instead" : "Player login instead"}
            </Link>
          </>
        ) : (
          <p className="text-xs text-zinc-600">
            Admin accounts are assigned by the platform owner only.
          </p>
        )}
        <Link
          href="/"
          className="block text-zinc-600 transition hover:text-zinc-400"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
