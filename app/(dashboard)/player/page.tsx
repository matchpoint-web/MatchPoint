import Link from "next/link";
import {
  formatNotificationTime,
  getNotificationHref,
} from "@/lib/player-notifications";
import { getPlayerDashboardData } from "@/lib/player-dashboard-service";
import { NotificationIcon } from "@/components/player/notifications/NotificationIcon";

export default async function PlayerDashboard() {
  let data;
  try {
    data = await getPlayerDashboardData();
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <div className="px-6 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/8 bg-white/[0.03] px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">
              Unable to load your dashboard right now.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { profile } = data;

  const metricCards = [
    {
      title: "Profile Completion",
      value: `${profile.completion}%`,
      description:
        profile.remainingSections === 0
          ? "Your recruiting profile looks complete."
          : `${profile.remainingSections} section${profile.remainingSections === 1 ? "" : "s"} remaining`,
      href: "/player/profile/edit",
      icon: "📋",
    },
    {
      title: "Documents",
      value: `${data.documents.requiredUploaded} / ${data.documents.requiredTotal}`,
      description: "Required documents uploaded",
      href: "/player/documents",
      icon: "📄",
    },
    {
      title: "Messages",
      value: String(data.unreadMessages),
      description:
        data.unreadMessages === 1
          ? "1 unread message"
          : `${data.unreadMessages} unread messages`,
      href: "/player/messages",
      icon: "💬",
    },
    {
      title: "Notifications",
      value: String(data.unreadNotifications),
      description:
        data.unreadNotifications === 1
          ? "1 unread notification"
          : `${data.unreadNotifications} unread notifications`,
      href: "/player/notifications",
      icon: "🔔",
    },
    {
      title: "Saved by Colleges",
      value: String(data.savedByCollegesCount),
      description: "Colleges that saved your profile",
      href: "/player/colleges",
      icon: "⭐",
    },
  ];

  const quickActions = [
    { label: "Edit Profile", href: "/player/profile/edit" },
    { label: "Upload Documents", href: "/player/documents" },
    { label: "Search Colleges", href: "/player/colleges" },
  ];

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 text-zinc-500 sm:h-28 sm:w-28">
              {profile.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.profileImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <svg
                  className="h-12 w-12 sm:h-14 sm:w-14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="mb-4 text-2xl font-semibold text-white sm:text-3xl">
                {profile.name}
              </h2>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "Country", value: profile.country },
                  { label: "Graduation Year", value: profile.graduationYear },
                  { label: "UTR Rating", value: profile.utr },
                  { label: "GPA", value: profile.gpa },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
                  >
                    <p className="mb-1 text-xs uppercase tracking-wider text-zinc-500">
                      {stat.label}
                    </p>
                    <p className="font-medium text-white">{stat.value || "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-sm font-medium uppercase tracking-wider text-zinc-500">
                Profile Completion
              </p>
              <p className="text-4xl font-bold tracking-tight text-emerald-400">
                {profile.completion}%
              </p>
              <p className="mt-2 max-w-md text-sm text-zinc-500">
                {profile.remainingSections === 0
                  ? "Your recruiting profile looks complete."
                  : `Complete ${profile.remainingSections} more section${profile.remainingSections === 1 ? "" : "s"} to improve your visibility to college coaches.`}
              </p>
              <Link
                href="/player/profile/edit"
                className="mt-4 inline-flex text-sm font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Edit Profile →
              </Link>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5 sm:max-w-xs">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                style={{ width: `${profile.completion}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metricCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 sm:p-8"
            >
              <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-2xl transition-transform duration-300 group-hover:scale-110">
                {card.icon}
              </span>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
                {card.title}
              </p>
              <p className="mb-2 text-3xl font-semibold tracking-tight text-white">
                {card.value}
              </p>
              <p className="text-sm leading-relaxed text-zinc-500">
                {card.description}
              </p>
            </Link>
          ))}
        </div>

        <section className="rounded-3xl border border-white/8 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-6 sm:p-8">
          <h3 className="mb-4 text-lg font-semibold tracking-tight text-white">
            Quick Actions
          </h3>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/8 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-6 sm:p-8">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Recent Activity
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Latest messages, saves, and profile views.
              </p>
            </div>
            <Link
              href="/player/notifications"
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
            >
              View all
            </Link>
          </div>

          {data.recentActivity.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-10 text-center">
              <p className="text-sm text-zinc-500">
                No recent activity yet. When coaches message or save you,
                updates will show up here.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {data.recentActivity.map((item) => (
                <li key={item.id}>
                  <Link
                    href={getNotificationHref(item.type)}
                    className={`flex items-start gap-3 rounded-2xl border px-3 py-3 transition hover:border-emerald-500/20 hover:bg-white/[0.05] ${
                      item.unread
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-white/5 bg-white/[0.03]"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                        item.unread
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border-white/10 bg-white/[0.04] text-zinc-400"
                      }`}
                    >
                      <NotificationIcon type={item.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-white">
                          {item.title}
                        </p>
                        <span
                          className="shrink-0 text-[10px] text-zinc-500"
                          suppressHydrationWarning
                        >
                          {formatNotificationTime(item.createdAt)}
                        </span>
                      </div>
                      <p className="truncate text-xs text-zinc-500">
                        {item.description}
                      </p>
                      <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                        {item.type}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
