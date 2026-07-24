import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata: Metadata = {
  title: "Terms of Service | MatchPoint",
  description: "Terms of Service for MatchPoint recruiting platform.",
};

export default function TermsPage() {
  return (
    <MarketingShell>
      <article className="mx-auto max-w-3xl px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-emerald-400">
          Legal
        </p>
        <h1 className="mb-10 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Terms of Service
        </h1>

        <div className="space-y-10 text-base leading-relaxed text-zinc-400">
          <section>
            <h2 className="mb-3 text-lg font-semibold tracking-tight text-white">
              1. Acceptance of Terms
            </h2>
            <p>By using MatchPoint, you agree to these Terms.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold tracking-tight text-white">
              2. Eligibility
            </h2>
            <p className="mb-3">Users must provide accurate information.</p>
            <p>
              Users are responsible for maintaining the security of their
              accounts.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold tracking-tight text-white">
              3. User Content
            </h2>
            <p className="mb-3">
              Players and colleges retain ownership of the content they upload.
            </p>
            <p>
              By uploading content, users grant MatchPoint permission to display
              and use that content within the platform for recruiting purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold tracking-tight text-white">
              4. Acceptable Use
            </h2>
            <p className="mb-3">Users may not:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Upload illegal or inappropriate content</li>
              <li>Impersonate another individual or organization</li>
              <li>Harass, abuse, or threaten other users</li>
              <li>Attempt unauthorized access to the platform</li>
              <li>Interfere with the operation of MatchPoint</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold tracking-tight text-white">
              5. Disclaimer
            </h2>
            <p className="mb-3">
              MatchPoint is a recruiting platform designed to connect players and
              colleges.
            </p>
            <p className="mb-3">We do not guarantee:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Athletic scholarships</li>
              <li>Admission to any college or university</li>
              <li>Recruiting opportunities or offers</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold tracking-tight text-white">
              6. Limitation of Liability
            </h2>
            <p>
              MatchPoint is not responsible for recruiting decisions, admissions
              decisions, or interactions between users.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold tracking-tight text-white">
              7. Changes to These Terms
            </h2>
            <p className="mb-3">These Terms may be updated periodically.</p>
            <p>
              Continued use of MatchPoint constitutes acceptance of any updates.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold tracking-tight text-white">
              8. Contact
            </h2>
            <p className="mb-3">
              For questions regarding these Terms, please contact:
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
