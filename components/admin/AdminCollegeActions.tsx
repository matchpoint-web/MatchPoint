"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SuspendReasonSelect } from "@/components/admin/SuspendReasonSelect";
import {
  approveCollegeAction,
  restoreCollegeAction,
  suspendCollegeAction,
} from "@/lib/admin/actions";
import type {
  CollegeAccountStatus,
  SuspendedReason,
} from "@/lib/account-status";

type AdminCollegeActionsProps = {
  collegeId: string;
  accountStatus: CollegeAccountStatus;
};

export function AdminCollegeActions({
  collegeId,
  accountStatus,
}: AdminCollegeActionsProps) {
  const router = useRouter();
  const [reason, setReason] = useState<SuspendedReason | "">("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSuspend() {
    if (!reason) {
      setError("Select a suspension reason before confirming.");
      return;
    }

    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await suspendCollegeAction(collegeId, reason);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(result.success);
      setReason("");
      router.refresh();
    });
  }

  function runSimple(
    action: (id: string) => Promise<{ error: string | null; success: string | null }>,
  ) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await action(collegeId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(result.success);
      router.refresh();
    });
  }

  const canSuspend =
    accountStatus === "PENDING" || accountStatus === "APPROVED";

  return (
    <div className="space-y-4">
      {accountStatus === "PENDING" ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => runSimple(approveCollegeAction)}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Working…" : "Approve college"}
        </button>
      ) : null}

      {canSuspend ? (
        <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <SuspendReasonSelect
            value={reason}
            onChange={setReason}
            disabled={isPending}
            id="college_suspended_reason"
          />
          <button
            type="button"
            disabled={isPending || !reason}
            onClick={handleSuspend}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Working…" : "Confirm suspension"}
          </button>
        </div>
      ) : null}

      {accountStatus === "SUSPENDED" ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => runSimple(restoreCollegeAction)}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Working…" : "Restore college"}
        </button>
      ) : null}

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
    </div>
  );
}
