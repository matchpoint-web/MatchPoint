import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireUser } from "@/lib/auth/actions";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireUser("player");
  return <DashboardShell>{children}</DashboardShell>;
}
