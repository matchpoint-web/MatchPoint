import { type ReactNode } from "react";

export type AdminNavItemConfig = {
  label: string;
  href: string;
  icon: ReactNode;
};

export const adminNavItems: AdminNavItemConfig[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: "Players",
    href: "/admin/players",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    label: "Colleges",
    href: "/admin/colleges",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 16.811V8.25a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 8.25v8.561M3 16.811c0 .952.624 1.792 1.515 2.106l6.24 2.208c.434.153.9.153 1.334 0l6.24-2.208C20.376 18.603 21 17.763 21 16.811M6.75 8.25V6a.75.75 0 01.75-.75h9a.75.75 0 01.75.75v2.25" />
      </svg>
    ),
  },
];

export function getAdminPageTitle(pathname: string): string {
  if (pathname === "/admin/dashboard" || pathname === "/admin") {
    return "Dashboard";
  }
  if (pathname.startsWith("/admin/players/")) {
    return "Player Details";
  }
  if (pathname.startsWith("/admin/colleges/")) {
    return "College Details";
  }

  const match = adminNavItems
    .filter((item) => item.href !== "/admin/dashboard")
    .find(
      (item) =>
        pathname === item.href || pathname.startsWith(`${item.href}/`),
    );

  return match?.label ?? "Dashboard";
}

export function isAdminNavItemActive(pathname: string, href: string): boolean {
  if (href === "/admin/dashboard") {
    return pathname === "/admin/dashboard" || pathname === "/admin";
  }
  if (href === "/admin/players") {
    return (
      pathname === "/admin/players" ||
      pathname.startsWith("/admin/players/")
    );
  }
  if (href === "/admin/colleges") {
    return (
      pathname === "/admin/colleges" ||
      pathname.startsWith("/admin/colleges/")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
