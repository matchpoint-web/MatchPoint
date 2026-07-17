"use client";

import { useEffect } from "react";

type ToastTone = "success" | "error";

type ToastProps = {
  message: string | null;
  tone: ToastTone;
  onDismiss: () => void;
};

export function Toast({ message, tone, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  const styles =
    tone === "success"
      ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
      : "border-red-500/30 bg-red-500/15 text-red-200";

  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-[100] max-w-sm rounded-2xl border px-4 py-3 text-sm shadow-xl backdrop-blur-md ${styles}`}
    >
      <div className="flex items-start gap-3">
        <p className="flex-1 leading-relaxed">{message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-current/70 transition hover:text-current"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
