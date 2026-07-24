import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata: Metadata = {
  title: "Contact | MatchPoint",
  description: "Contact MatchPoint support.",
};

export default function ContactPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-6 py-16 text-center sm:px-10 lg:px-16 lg:py-24">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-emerald-400">
          Support
        </p>
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Contact
        </h1>

        <div className="rounded-3xl border border-white/8 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 px-8 py-12 sm:px-12">
          <p className="mb-6 text-lg text-zinc-300">
            Have a question or need assistance?
          </p>
          <p className="mb-2 text-sm text-zinc-500">Please contact us at:</p>
          <p className="mb-6">
            <a
              href="mailto:support.matchpointrecruiting@gmail.com"
              className="text-lg font-medium text-emerald-400 transition hover:text-emerald-300"
            >
              support.matchpointrecruiting@gmail.com
            </a>
          </p>
          <p className="text-sm text-zinc-500">
            We&apos;ll respond as soon as possible.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
