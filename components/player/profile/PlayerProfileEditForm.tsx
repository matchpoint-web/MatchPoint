"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { Toast } from "@/components/ui/Toast";
import { GlassCard } from "@/components/player/GlassCard";
import { savePlayerProfile } from "@/lib/players/actions";
import {
  type PlayerProfileFormValues,
  type SavePlayerProfileState,
} from "@/lib/players/types";

type PlayerProfileEditFormProps = {
  initialValues: PlayerProfileFormValues;
};

const INITIAL_SAVE_STATE: SavePlayerProfileState = {
  error: null,
  success: null,
};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/30";

const selectClassName = `${inputClassName} appearance-auto`;

const optionClassName = "bg-zinc-900 text-white";

const labelClassName = "mb-1.5 block text-sm text-zinc-400";

export function PlayerProfileEditForm({
  initialValues,
}: PlayerProfileEditFormProps) {
  const [state, formAction, pending] = useActionState(
    savePlayerProfile,
    INITIAL_SAVE_STATE,
  );
  const [toast, setToast] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialValues.profile_image_url,
  );
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialValues.profile_image_url,
  );
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (state.success) {
      setToast({ message: state.success, tone: "success" });
      if (state.profileImageUrl) {
        setImageUrl(state.profileImageUrl);
        setPreviewUrl(state.profileImageUrl);
      }
    } else if (state.error) {
      setToast({ message: state.error, tone: "error" });
    }
  }, [state]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);
  }

  return (
    <>
      <form action={formAction} className="space-y-8">
        <GlassCard className="p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="shrink-0">
              <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-500/30 bg-gradient-to-br from-zinc-800 to-zinc-900 sm:h-36 sm:w-36">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg
                    className="h-14 w-14 text-zinc-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
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
            </div>

            <div className="w-full flex-1 text-center sm:text-left">
              <p className="mb-2 text-sm font-medium text-white">
                Profile image
              </p>
              <p className="mb-4 text-sm text-zinc-500">
                PNG or JPG up to 5MB.
              </p>
              <input type="hidden" name="existing_profile_image_url" value={imageUrl ?? ""} />
              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/10">
                Upload photo
                <input
                  type="file"
                  name="profile_image"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="full_name" className={labelClassName}>
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                defaultValue={initialValues.full_name}
                className={inputClassName}
                placeholder="Alex Tanaka"
              />
            </div>

            <div>
              <label htmlFor="nationality" className={labelClassName}>
                Country
              </label>
              <input
                id="nationality"
                name="nationality"
                type="text"
                defaultValue={initialValues.nationality}
                className={inputClassName}
                placeholder="Japan"
              />
            </div>

            <div>
              <label htmlFor="graduation_year" className={labelClassName}>
                Graduation Year
              </label>
              <input
                id="graduation_year"
                name="graduation_year"
                type="number"
                min={2020}
                max={2040}
                defaultValue={initialValues.graduation_year}
                className={inputClassName}
                placeholder="2027"
              />
            </div>

            <div>
              <label htmlFor="utr" className={labelClassName}>
                UTR
              </label>
              <input
                id="utr"
                name="utr"
                type="number"
                step="0.01"
                min={1}
                max={16.5}
                defaultValue={initialValues.utr}
                className={inputClassName}
                placeholder="11.2"
              />
            </div>

            <div>
              <label htmlFor="gpa" className={labelClassName}>
                GPA
              </label>
              <input
                id="gpa"
                name="gpa"
                type="number"
                step="0.01"
                min={0}
                max={4}
                defaultValue={initialValues.gpa}
                className={inputClassName}
                placeholder="3.8"
              />
            </div>

            <div>
              <label htmlFor="height" className={labelClassName}>
                Height (cm)
              </label>
              <input
                id="height"
                name="height"
                type="number"
                step="0.1"
                min={100}
                max={250}
                defaultValue={initialValues.height}
                className={inputClassName}
                placeholder="178"
              />
            </div>

            <div>
              <label htmlFor="weight" className={labelClassName}>
                Weight (kg)
              </label>
              <input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                min={30}
                max={200}
                defaultValue={initialValues.weight}
                className={inputClassName}
                placeholder="70"
              />
            </div>

            <div>
              <label htmlFor="dominant_hand" className={labelClassName}>
                Dominant Hand
              </label>
              <select
                id="dominant_hand"
                name="dominant_hand"
                defaultValue={initialValues.dominant_hand || ""}
                className={selectClassName}
                style={{ colorScheme: "dark" }}
              >
                <option value="" className={optionClassName}>
                  Select
                </option>
                <option value="Right" className={optionClassName}>
                  Right
                </option>
                <option value="Left" className={optionClassName}>
                  Left
                </option>
              </select>
            </div>

            <div>
              <label htmlFor="backhand" className={labelClassName}>
                Backhand
              </label>
              <select
                id="backhand"
                name="backhand"
                defaultValue={initialValues.backhand || ""}
                className={selectClassName}
                style={{ colorScheme: "dark" }}
              >
                <option value="" className={optionClassName}>
                  Select
                </option>
                <option value="One-handed" className={optionClassName}>
                  One-handed
                </option>
                <option value="Two-handed" className={optionClassName}>
                  Two-handed
                </option>
              </select>
            </div>

            <div>
              <label htmlFor="date_of_birth" className={labelClassName}>
                Date of Birth
              </label>
              <input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                defaultValue={initialValues.date_of_birth}
                className={inputClassName}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="bio" className={labelClassName}>
                Biography
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={5}
                defaultValue={initialValues.bio}
                className={`${inputClassName} resize-y`}
                placeholder="Tell colleges about your game, goals, and story."
              />
            </div>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/player/profile"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </form>

      <Toast
        message={toast?.message ?? null}
        tone={toast?.tone ?? "success"}
        onDismiss={() => setToast(null)}
      />
    </>
  );
}
