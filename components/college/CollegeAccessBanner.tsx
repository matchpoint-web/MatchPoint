import { formatAccountStatus } from "@/lib/account-status";
import type { CollegeAccountStatus } from "@/lib/account-status";

type CollegeAccessBannerProps = {
  status: CollegeAccountStatus;
};

export function CollegeAccessBanner({ status }: CollegeAccessBannerProps) {
  if (status === "APPROVED") return null;

  const isPending = status === "PENDING";

  return (
    <div
      className={`border-b px-6 py-3 text-sm sm:px-8 lg:px-10 ${
        isPending
          ? "border-amber-500/20 bg-amber-500/10 text-amber-100"
          : "border-red-500/20 bg-red-500/10 text-red-100"
      }`}
    >
      <p className="mx-auto max-w-6xl">
        {isPending
          ? "Your college account is pending MatchPoint approval. You can update settings, but recruiting features stay locked until approved."
          : `Your college account is ${formatAccountStatus(status).toLowerCase()}. Recruiting features are unavailable. Contact MatchPoint support.`}
      </p>
    </div>
  );
}
