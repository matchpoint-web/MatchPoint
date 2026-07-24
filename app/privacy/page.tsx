import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata: Metadata = {
  title: "Privacy Policy | MatchPoint",
  description: "Privacy Policy for MatchPoint recruiting platform.",
};

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <article className="mx-auto max-w-3xl px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-emerald-400">
          Legal
        </p>
        <h1 className="mb-10 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Privacy Policy
        </h1>

        <div className="space-y-10 text-base leading-relaxed text-zinc-400">
          <section>
            <h2 className="mb-3 text-lg font-semibold tracking-tight text-white">
              1. Information We Collect
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Account information</li>
              <li>Recruiting profile information</li>
              <li>Uploaded documents</li>
              <li>Highlight videos</li>
              <li>Messages</li>
              <li>Basic usage information</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold tracking-tight text-white">
              2. How We Use Information
            </h2>
            <p className="mb-3">We use collected information to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Operate MatchPoint</li>
              <li>Improve the platform</li>
              <li>Connect players and colleges</li>
              <li>Provide customer support</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold tracking-tight text-white">
              3. Data Sharing
            </h2>
            <p className="mb-3">We do not sell personal information.</p>
            <p>
              Information is only shared as necessary to provide recruiting
              services through the platform.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold tracking-tight text-white">
              4. Data Storage
            </h2>
            <p>User data is securely stored using Supabase.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold tracking-tight text-white">
              5. Cookies
            </h2>
            <p>
              MatchPoint may use cookies and similar technologies for
              authentication and improving user experience.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold tracking-tight text-white">
              6. Your Rights
            </h2>
            <p>
              Users may update or delete their information at any time through
              their account settings.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold tracking-tight text-white">
              7. Contact
            </h2>
            <p className="mb-3">
              For privacy-related questions, please contact:
            </p>
            <p>
              <a
                href="mailto:support.matchpointrecruiting@gmail.com"
                className="text-emerald-400 transition hover:text-emerald-300"
              >
                support.matchpointrecruiting@gmail.com
              </a>
            </p>
          </section>
        </div>
      </article>
    </MarketingShell>
  );
}
