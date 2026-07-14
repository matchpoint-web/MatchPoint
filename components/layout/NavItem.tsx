"use client";

import Link from "next/link";
import { type ReactNode } from "react";

type NavItemProps = {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  onNavigate?: () => void;
};

export function NavItem({
  href,
  label,
  icon,
  active,
  onNavigate,
}: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/10"
          : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
      }`}
    >
      <span
        className={`shrink-0 transition-colors ${
          active
            ? "text-emerald-400"
            : "text-zinc-500 group-hover:text-zinc-300"
        }`}
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}
