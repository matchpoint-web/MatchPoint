"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/player/GlassCard";
import { SectionTitle } from "@/components/player/SectionTitle";
import {
  coachNoteStatuses,
  getCoachNotes,
  saveCoachNotes,
  type CoachNoteStatus,
} from "@/lib/coach-notes";

type CoachNotesProps = {
  playerId: string;
};

const DEFAULT_STATUS: CoachNoteStatus = "Prospect";

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-200 outline-none transition-colors hover:border-white/15 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20";

export function CoachNotes({ playerId }: CoachNotesProps) {
  const [status, setStatus] = useState<CoachNoteStatus>(DEFAULT_STATUS);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getCoachNotes(playerId);
    setStatus(existing?.status ?? DEFAULT_STATUS);
    setNotes(existing?.notes ?? "");
    setSaved(false);
  }, [playerId]);

  function handleSave() {
    saveCoachNotes(playerId, status, notes);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <section>
      <SectionTitle title="Coach Notes" />
      <GlassCard className="p-6 sm:p-8">
        <div className="grid gap-6">
          <div>
            <label
              htmlFor="coach-note-status"
              className="mb-3 block text-xs font-medium uppercase tracking-wider text-zinc-500"
            >
              Status
            </label>
            <select
              id="coach-note-status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as CoachNoteStatus);
                setSaved(false);
              }}
              className={inputClassName}
              style={{ colorScheme: "dark" }}
            >
              {coachNoteStatuses.map((option) => (
                <option key={option} value={option} className="bg-zinc-900">
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="coach-note-notes"
              className="mb-3 block text-xs font-medium uppercase tracking-wider text-zinc-500"
            >
              Notes
            </label>
            <textarea
              id="coach-note-notes"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setSaved(false);
              }}
              placeholder="Private recruiting notes..."
              rows={5}
              className={`${inputClassName} resize-none placeholder:text-zinc-600`}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition-all duration-300 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25"
          >
            Save Notes
          </button>
          {saved ? (
            <span className="text-sm font-medium text-emerald-400">
              Notes saved
            </span>
          ) : null}
        </div>
      </GlassCard>
    </section>
  );
}
