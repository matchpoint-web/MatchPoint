"use client";

import Link from "next/link";
import { NotificationIcon } from "./NotificationIcon";
import {
  formatNotificationTime,
  getNotificationHref,
  type PlayerNotification,
} from "@/lib/player-notifications";

type NotificationItemProps = {
  notification: PlayerNotification;
  onOpen: (id: string) => void;
};

export function NotificationItem({
  notification,
  onOpen,
}: NotificationItemProps) {
  const href = getNotificationHref(notification.type);

  return (
    <Link
      href={href}
      onClick={() => onOpen(notification.id)}
      className={`flex items-start gap-4 rounded-3xl border p-4 transition-all sm:p-5 ${
        notification.unread
          ? "border-emerald-500/25 bg-emerald-500/5 hover:border-emerald-500/35"
          : "border-white/[0.08] bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 hover:border-emerald-500/20"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
          notification.unread
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            : "border-white/10 bg-white/[0.04] text-zinc-400"
        }`}
      >
        <NotificationIcon type={notification.type} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-start justify-between gap-3">
          <p className="font-semibold tracking-tight text-white">
            {notification.title}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs text-zinc-500" suppressHydrationWarning>
              {formatNotificationTime(notification.createdAt)}
            </span>
            {notification.unread ? (
              <span
                className="h-2 w-2 rounded-full bg-emerald-400"
                aria-label="Unread"
              />
            ) : null}
          </div>
        </div>
        <p className="text-sm leading-relaxed text-zinc-500">
          {notification.description}
        </p>
        <p className="mt-2 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
          {notification.type}
        </p>
      </div>
    </Link>
  );
}
