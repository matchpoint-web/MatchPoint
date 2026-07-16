"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { NotificationItem } from "./NotificationItem";
import {
  mockPlayerNotifications,
  type PlayerNotification,
} from "@/lib/player-notifications";

export function PlayerNotificationsClient() {
  const [notifications, setNotifications] = useState<PlayerNotification[]>(
    mockPlayerNotifications,
  );

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications],
  );

  function markAllAsRead() {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, unread: false })),
    );
  }

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, unread: false } : item,
      ),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500">
          {unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
            : "You're all caught up."}
        </p>
        <button
          type="button"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Mark all as read
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-3xl border border-white/8 bg-white/[0.03] px-6 py-16 text-center">
          <h2 className="text-xl font-semibold tracking-tight text-white">
            No Notifications
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-zinc-500">
            When colleges view or save your profile, or send messages, updates
            will appear here.
          </p>
          <Link
            href="/player/colleges"
            className="mt-8 inline-flex rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
          >
            Browse Colleges
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onOpen={markAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
