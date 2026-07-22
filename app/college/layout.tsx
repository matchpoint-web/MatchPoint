import { CollegeAccessBanner } from "@/components/college/CollegeAccessBanner";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { CollegeProfileProvider } from "@/components/college/CollegeProfileProvider";
import { requireUser } from "@/lib/auth/actions";
import { getCurrentCollegeAccountStatus } from "@/lib/college-access";
import { getCurrentCollegeProfile } from "@/lib/college-profile-service";

export default async function CollegeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireUser("college");
  const [collegeProfile, accountStatus] = await Promise.all([
    getCurrentCollegeProfile(),
    getCurrentCollegeAccountStatus(),
  ]);

  return (
    <CollegeProfileProvider initialProfile={collegeProfile}>
      <DashboardShell>
        {accountStatus && accountStatus !== "APPROVED" ? (
          <CollegeAccessBanner status={accountStatus} />
        ) : null}
        {children}
      </DashboardShell>
    </CollegeProfileProvider>
  );
}
