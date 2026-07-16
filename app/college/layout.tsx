import { DashboardShell } from "@/components/layout/DashboardShell";
import { CollegeProfileProvider } from "@/components/college/CollegeProfileProvider";
import { requireUser } from "@/lib/auth/actions";
import { getCurrentCollegeProfile } from "@/lib/college-profile-service";

export default async function CollegeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireUser("college");
  const collegeProfile = await getCurrentCollegeProfile();

  return (
    <CollegeProfileProvider initialProfile={collegeProfile}>
      <DashboardShell>{children}</DashboardShell>
    </CollegeProfileProvider>
  );
}
