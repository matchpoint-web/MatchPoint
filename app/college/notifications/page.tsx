import Link from "next/link";

const notifications = [
  {
    id: "1",
    title: "Follow up with Alex Tanaka today.",
    detail: "Reminder from Coach Notes · Due today",
    href: "/college/players/1",
    unread: true,
  },
  {
    id: "2",
    title: "Follow up with Yuta Kikuchi today.",
    detail: "Reminder from Coach Notes · Due today",
    href: "/college/players/2",
    unread: true,
  },
  {
    id: "3",
    title: "New message from Minho Kim",
    detail: "TOEFL score update · 2h ago",
    href: "/college/messages",
    unread: false,
  },
];

export default function CollegeNotificationsPage() {
  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="mb-6 text-sm text-zinc-500">
          Follow-up reminders, messages, and recruiting alerts.
        </p>

        <div className="space-y-3">
          {notifications.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`block rounded-3xl border p-5 transition-all hover:border-emerald-500/20 ${
                item.unread
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-white/[0.08] bg-gradient-to-b from-zinc-900/80 to-zinc-950/80"
              }`}
            >
              <div className="flex items-start gap-3">
                {item.unread && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                )}
                <div className={item.unread ? "" : "pl-5"}>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-zinc-500">{item.detail}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
