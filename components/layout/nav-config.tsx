import { type ReactNode } from "react";
import {
  collegeNavItems,
  getCollegePageTitle,
  isCollegeNavItemActive,
} from "./college-nav-config";

export type NavItemConfig = {
  label: string;
  href: string;
  icon: ReactNode;
};

export type PortalType = "player" | "college";

/** Player MVP: only routes that exist today. */
export const navItems: NavItemConfig[] = [
  {
    label: "Dashboard",
    href: "/player",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: "College Search",
    href: "/player/colleges",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 16.811V8.25a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 8.25v8.561M3 16.811c0 .952.624 1.792 1.515 2.106l6.24 2.208c.434.153.9.153 1.334 0l6.24-2.208C20.376 18.603 21 17.763 21 16.811M6.75 8.25V6a.75.75 0 01.75-.75h9a.75.75 0 01.75.75v2.25" />
      </svg>
    ),
  },
  {
    label: "Notifications",
    href: "/player/notifications",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
  {
    label: "Documents",
    href: "/player/documents",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    label: "My Profile",
    href: "/player/profile",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
];

export function getPortal(pathname: string): PortalType {
  return pathname.startsWith("/college") ? "college" : "player";
}

export function getNavItems(pathname: string): NavItemConfig[] {
  return getPortal(pathname) === "college" ? collegeNavItems : navItems;
}

export function getHomeHref(pathname: string): string {
  return getPortal(pathname) === "college" ? "/college/dashboard" : "/player";
}

export function getProfileHref(pathname: string): string {
  return getPortal(pathname) === "college"
    ? "/college/settings"
    : "/player/profile";
}

export function getPageTitle(pathname: string): string {
  if (getPortal(pathname) === "college") {
    return getCollegePageTitle(pathname);
  }

  if (pathname === "/player") return "Dashboard";
  if (pathname.startsWith("/player/colleges/")) return "College Details";
  if (pathname === "/player/messages") return "Messages";
  if (pathname === "/player/notifications") return "Notifications";
  if (pathname === "/player/documents") return "Documents";

  const match = navItems
    .filter((item) => item.href !== "/player")
    .find(
      (item) =>
        pathname === item.href || pathname.startsWith(`${item.href}/`),
    );

  return match?.label ?? "Dashboard";
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (getPortal(pathname) === "college") {
    return isCollegeNavItemActive(pathname, href);
  }

  if (href === "/player") {
    return pathname === "/player";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
