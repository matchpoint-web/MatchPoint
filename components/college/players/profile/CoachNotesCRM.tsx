"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/player/GlassCard";
import { SectionTitle } from "@/components/player/SectionTitle";
import {
  getCoachCRMData,
  recruitingStatuses,
  saveCoachCRMData,
  type CoachCRMData,
  type RecruitingStatus,
} from "@/lib/coach-crm";

type CoachNotesCRMProps = {
  playerId: string;
  playerName: string;
};

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-200 outline-none transition-colors hover:border-white/15 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20";

export function CoachNotesCRM({ playerId, playerName }: CoachNotesCRMProps) {
  const [notes, setNotes] = useState<CoachCRMData>(() =>
    getCoachCRMData(playerId, {
      rating: 5,
      status: "Interested",
      privateNotes: "",
    }),
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNotes(getCoachCRMData(playerId, { rating: 5, status: "Interested" }));
  }, [playerId]);

  function update<K extends keyof CoachCRMData>(
    key: K,
    value: CoachCRMData[K],
  ) {
    setNotes((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    saveCoachCRMData(playerId, notes, playerName);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <section>
      <SectionTitle
        title="Coach Notes"
        subtitle="Private — visible only to your college staff."
      />
      <GlassCard className="border-amber-500/10 p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Prospect Rating */}
          <div>
            <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Prospect Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => update("rating", star)}
                  className="rounded-lg p-1 text-2xl transition-transform hover:scale-110"
                  aria-label={`Rate ${star} out of 5 stars`}
                >
                  <span
                    className={
                      star <= notes.rating ? "text-amber-400" : "text-zinc-600"
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-zinc-500">
              {"★".repeat(notes.rating)}
              {"☆".repeat(5 - notes.rating)}
            </p>
          </div>

          {/* Recruiting Status */}
          <div>
            <label
              htmlFor="recruiting-status"
              className="mb-3 block text-xs font-medium uppercase tracking-wider text-zinc-500"
            >
              Recruiting Status
            </label>
            <select
              id="recruiting-status"
              value={notes.status}
              onChange={(e) =>
                update("status", e.target.value as RecruitingStatus)
              }
              className={inputClassName}
            >
              {recruitingStatuses.map((status) => (
                <option key={status} value={status} className="bg-zinc-900">
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Follow-up Reminder */}
          <div className="lg:col-span-2">
            <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Follow-up Reminder
            </label>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <input
                type="date"
                value={notes.followUpDate}
                onChange={(e) => update("followUpDate", e.target.value)}
                disabled={!notes.reminderEnabled}
                className={`${inputClassName} sm:max-w-xs disabled:cursor-not-allowed disabled:opacity-40`}
              />
              <label className="inline-flex cursor-pointer items-center gap-3">
                <span className="text-sm text-zinc-400">Enable Reminder</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notes.reminderEnabled}
                  onClick={() =>
                    update("reminderEnabled", !notes.reminderEnabled)
                  }
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${
                    notes.reminderEnabled ? "bg-emerald-500" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-300 ${
                      notes.reminderEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>
            </div>
            {notes.reminderEnabled && notes.followUpDate && (
              <p className="mt-3 text-xs text-zinc-500">
                Dashboard notification on{" "}
                {new Date(notes.followUpDate + "T00:00:00").toLocaleDateString(
                  "en-US",
                  { month: "long", day: "numeric", year: "numeric" },
                )}
                : &ldquo;Follow up with {playerName} today.&rdquo;
              </p>
            )}
          </div>

          {/* Private Notes */}
          <div className="lg:col-span-2">
            <label
              htmlFor="private-notes"
              className="mb-3 block text-xs font-medium uppercase tracking-wider text-zinc-500"
            >
              Private Notes
            </label>
            <textarea
              id="private-notes"
              value={notes.privateNotes}
              onChange={(e) => update("privateNotes", e.target.value)}
              placeholder="Write internal recruiting notes..."
              rows={5}
              className={`${inputClassName} resize-none placeholder:text-zinc-600`}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition-all duration-300 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25"
          >
            Save Notes
          </button>
          {saved && (
            <span className="text-sm font-medium text-emerald-400">
              Notes saved
            </span>
          )}
        </div>
      </GlassCard>
    </section>
  );
}
