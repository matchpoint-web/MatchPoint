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
