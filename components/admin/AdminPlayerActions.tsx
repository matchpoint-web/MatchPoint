"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SuspendReasonSelect } from "@/components/admin/SuspendReasonSelect";
import {
  restorePlayerAction,
  suspendPlayerAction,
} from "@/lib/admin/actions";
import type {
  PlayerAccountStatus,
  SuspendedReason,
} from "@/lib/account-status";

type AdminPlayerActionsProps = {
  playerId: string;
  accountStatus: PlayerAccountStatus;
};

export function AdminPlayerActions({
  playerId,
  accountStatus,
}: AdminPlayerActionsProps) {
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
      const result = await suspendPlayerAction(playerId, reason);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(result.success);
      setReason("");
      router.refresh();
    });
  }

  function handleRestore() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await restorePlayerAction(playerId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(result.success);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {accountStatus === "ACTIVE" ? (
        <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <SuspendReasonSelect
            value={reason}
            onChange={setReason}
            disabled={isPending}
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
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={handleRestore}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Working…" : "Restore player"}
        </button>
      )}

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
    </div>
  );
}
