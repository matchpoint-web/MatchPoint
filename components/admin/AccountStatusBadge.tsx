import type {
  CollegeAccountStatus,
  PlayerAccountStatus,
} from "@/lib/account-status";
import { formatAccountStatus } from "@/lib/account-status";

type AccountStatusBadgeProps = {
  status: PlayerAccountStatus | CollegeAccountStatus;
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  APPROVED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  SUSPENDED: "border-red-500/30 bg-red-500/10 text-red-300",
};

export function AccountStatusBadge({ status }: AccountStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status] ?? "border-white/10 bg-white/5 text-zinc-300"}`}
    >
      {formatAccountStatus(status)}
    </span>
  );
}
