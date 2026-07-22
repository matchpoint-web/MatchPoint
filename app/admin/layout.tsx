import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireAdmin } from "@/lib/auth/actions";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();

  return <DashboardShell>{children}</DashboardShell>;
}
