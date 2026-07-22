"use client";

import {
  formatSuspendedReason,
  SUSPENDED_REASONS,
  type SuspendedReason,
} from "@/lib/account-status";

type SuspendReasonSelectProps = {
  value: SuspendedReason | "";
  onChange: (value: SuspendedReason | "") => void;
  disabled?: boolean;
  id?: string;
};

export function SuspendReasonSelect({
  value,
  onChange,
  disabled = false,
  id = "suspended_reason",
}: SuspendReasonSelectProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-zinc-400">
        Suspension reason
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        required
        onChange={(event) => {
          const next = event.target.value;
          onChange(
            next === "" ? "" : (next as SuspendedReason),
          );
        }}
        className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="" disabled>
          Select a reason
        </option>
        {SUSPENDED_REASONS.map((reason) => (
          <option key={reason} value={reason}>
            {formatSuspendedReason(reason)}
          </option>
        ))}
      </select>
    </div>
  );
}
