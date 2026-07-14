import { DashboardShell } from "@/components/layout/DashboardShell";

export default function CollegeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardShell>{children}</DashboardShell>;
}
