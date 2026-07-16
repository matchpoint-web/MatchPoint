"use client";

import { useEffect, useState, useTransition } from "react";
import { GlassCard } from "@/components/player/GlassCard";
import { SectionTitle } from "@/components/player/SectionTitle";
import {
  coachNoteStatuses,
  type CoachNote,
  type CoachNoteStatus,
} from "@/lib/coach-notes";
import { saveCoachNoteAction } from "@/lib/coach-notes/actions";

type CoachNotesProps = {
  playerId: string;
  initialNote?: CoachNote | null;
};

const DEFAULT_STATUS: CoachNoteStatus = "Prospect";

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-200 outline-none transition-colors hover:border-white/15 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20";

export function CoachNotes({
  playerId,
  initialNote = null,
}: CoachNotesProps) {
  const [status, setStatus] = useState<CoachNoteStatus>(
    initialNote?.status ?? DEFAULT_STATUS,
  );
  const [notes, setNotes] = useState(initialNote?.notes ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setStatus(initialNote?.status ?? DEFAULT_STATUS);
    setNotes(initialNote?.notes ?? "");
    setSaved(false);
    setError(null);
  }, [playerId, initialNote]);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveCoachNoteAction(playerId, status, notes);
      if (result.error) {
        setError(result.error);
        setSaved(false);
        return;
      }
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    });
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
                setError(null);
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
                setError(null);
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
          {error ? (
            <span className="text-sm font-medium text-red-400">{error}</span>
          ) : null}
        </div>
      </GlassCard>
    </section>
  );
}
