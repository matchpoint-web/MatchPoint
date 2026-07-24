import Link from "next/link";
import type { ReactNode } from "react";

type MarketingShellProps = {
  children: ReactNode;
};

const footerLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/contact", label: "Contact" },
] as const;

/** Shared dark marketing layout (landing + legal pages). */
export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-[100px]" />
        <div className="absolute bottom-0 -left-32 h-[350px] w-[350px] rounded-full bg-emerald-600/8 blur-[90px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="border-b border-white/5 px-6 py-5 sm:px-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-white transition hover:text-zinc-300"
            >
              MatchPoint
            </Link>
            <Link
              href="/"
              className="text-sm text-zinc-500 transition hover:text-zinc-300"
            >
              Home
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <MarketingFooter />
      </div>
    </div>
  );
}

export function MarketingFooter() {
  return (
    <footer className="relative z-10 border-t border-white/5 px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-sm text-zinc-600">&copy; 2026 MatchPoint</p>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-500 transition hover:text-zinc-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
