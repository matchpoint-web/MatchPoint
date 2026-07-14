import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireUser } from "@/lib/auth/actions";

export default async function CollegeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireUser("college");
  return <DashboardShell>{children}</DashboardShell>;
}
