"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getNotificationHref,
  type PlayerNotification,
} from "@/lib/player-notifications";
import {
  getNotificationsAction,
  markAllAsReadAction,
  markAsReadAction,
} from "@/lib/notifications/actions";

/**
 * College notifications list — same Supabase service + read/unread behavior
 * as player notifications, in the existing college page layout.
 */
export function CollegeNotificationsClient() {
  const [notifications, setNotifications] = useState<PlayerNotification[]>([]);
  const [loaded, setLoaded] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const next = await getNotificationsAction();
        if (!cancelled) {
          setNotifications(next);
        }
      } catch {
        if (!cancelled) {
          setNotifications([]);
        }
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function markAsRead(id: string) {
    const target = notifications.find((item) => item.id === id);
    if (!target?.unread) return;

    const previous = notifications;
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, unread: false } : item,
      ),
    );

    const result = await markAsReadAction(id);
    if (result.error) {
      setNotifications(previous);
    }
  }

  async function markAllAsRead() {
    if (unreadCount === 0) return;

    const previous = notifications;
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, unread: false })),
    );

    const result = await markAllAsReadAction();
    if (result.error) {
      setNotifications(previous);
    }
  }

  if (loaded && notifications.length === 0) {
    return (
      <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 px-6 py-16 text-center">
        <p className="font-medium text-white">No notifications yet</p>
        <p className="mt-2 text-sm text-zinc-500">
          Follow-up reminders, messages, and recruiting alerts will appear here.
        </p>
      </div>
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
          onClick={() => void markAllAsRead()}
          disabled={unreadCount === 0}
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((item) => (
          <Link
            key={item.id}
            href={getNotificationHref(item.type, {
              portal: "college",
              metadata: item.metadata,
            })}
            onClick={() => {
              void markAsRead(item.id);
            }}
            className={`block rounded-3xl border p-5 transition-all hover:border-emerald-500/20 ${
              item.unread
                ? "border-emerald-500/25 bg-emerald-500/5 hover:border-emerald-500/35"
                : "border-white/[0.08] bg-gradient-to-b from-zinc-900/80 to-zinc-950/80"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  item.unread ? "bg-emerald-400" : "bg-transparent"
                }`}
                aria-label={item.unread ? "Unread" : undefined}
                aria-hidden={!item.unread}
              />
              <div className="min-w-0 flex-1">
                <p
                  className={`font-medium ${
                    item.unread ? "text-white" : "text-zinc-200"
                  }`}
                >
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-zinc-500">{item.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
