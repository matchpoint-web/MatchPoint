export default function CollegeSettingsPage() {
  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <p className="text-sm text-zinc-500">
          Manage your college recruiting account and staff preferences.
        </p>

        <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-6 sm:p-8">
          <h2 className="mb-6 text-lg font-semibold text-white">
            Program Profile
          </h2>
          <div className="space-y-4">
            {[
              { label: "College", value: "Stanford University" },
              { label: "Division", value: "NCAA Division I" },
              { label: "Location", value: "Stanford, CA" },
              { label: "Primary Recruiter", value: "Coach Michael Rivera" },
              { label: "Account Email", value: "recruiting@stanford.edu" },
            ].map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-xs uppercase tracking-wider text-zinc-500">
                  {row.label}
                </span>
                <span className="text-sm font-medium text-white">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-6 sm:p-8">
          <h2 className="mb-2 text-lg font-semibold text-white">
            Notification Preferences
          </h2>
          <p className="mb-5 text-sm text-zinc-500">
            Follow-up reminders will appear in Notifications and on the
            dashboard.
          </p>
          <ul className="space-y-3 text-sm text-zinc-300">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Follow-up reminder alerts
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              New message notifications
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Saved player activity updates
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
