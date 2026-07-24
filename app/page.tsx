import Link from "next/link";
import { MarketingFooter } from "@/components/marketing/MarketingShell";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-[100px]" />
        <div className="absolute bottom-0 -left-32 h-[350px] w-[350px] rounded-full bg-emerald-600/8 blur-[90px]" />
      </div>

      <main className="relative z-10">
        <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 py-24 sm:px-10 lg:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.08)_0%,_transparent_70%)]" />

          <div className="relative mx-auto max-w-5xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-400 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Early Access
            </div>

            <h1 className="mb-6 bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-6xl font-bold tracking-tight text-transparent sm:text-7xl md:text-8xl lg:text-9xl">
              MatchPoint
            </h1>

            <p className="mb-6 text-xl font-light tracking-wide text-zinc-300 sm:text-2xl md:text-3xl">
              Build Your Recruiting Profile.
              <br />
              Get Discovered.
              <br />
              Play College Tennis in the U.S.
            </p>

            <p className="mx-auto mb-12 max-w-2xl text-base leading-relaxed text-zinc-500 sm:text-lg">
              Where Tennis Meets Opportunity.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <Link
                href="/player"
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-10 py-4 text-center text-lg font-semibold text-black shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-emerald-500/40 sm:w-auto sm:min-w-[220px]"
              >
                <span className="relative z-10">I&apos;m a Player</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>

              <Link
                href="/college/dashboard"
                className="group w-full rounded-2xl border border-white/15 bg-white/5 px-10 py-4 text-center text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:border-amber-400/40 hover:bg-white/10 hover:shadow-lg hover:shadow-amber-500/10 sm:w-auto sm:min-w-[220px]"
              >
                I&apos;m a College
              </Link>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
            <div className="h-8 w-5 rounded-full border-2 border-zinc-600">
              <div className="mx-auto mt-1.5 h-1.5 w-1 rounded-full bg-zinc-500" />
            </div>
          </div>
        </section>

        <section className="px-6 py-24 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {[
                {
                  label: "FOR PLAYERS",
                  description:
                    "Discover college opportunities that match your profile.",
                },
                {
                  label: "FOR COLLEGES",
                  description:
                    "Find talented players from around the world.",
                },
                {
                  label: "DIRECT CONNECT",
                  description: "Connect directly with the right people.",
                },
              ].map((feature) => (
                <div
                  key={feature.label}
                  className="group relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5"
                >
                  <div className="relative">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-400">
                      {feature.label}
                    </h3>
                    <p className="text-lg leading-relaxed text-zinc-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-24 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-3xl">
            <div className="overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-zinc-900 to-black px-8 py-14 text-center sm:px-12">
              <p className="mb-3 text-sm font-medium uppercase tracking-widest text-emerald-400">
                Coming Soon
              </p>
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Early Access
              </h2>
              <p className="mx-auto mb-8 max-w-md text-zinc-500">
                Join the first group of players and colleges.
                <br />
                Be among the first to experience MatchPoint before public
                launch.
              </p>
              <Link
                href="/auth/player/signup"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-10 py-4 text-lg font-semibold text-black shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-emerald-500/40"
              >
                Join Early Access
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
