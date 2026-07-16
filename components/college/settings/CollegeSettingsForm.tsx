"use client";

import { useEffect, useState } from "react";
import { Toast } from "@/components/ui/Toast";
import { GlassCard } from "@/components/player/GlassCard";
import {
  getCollegeProfile,
  getUniversityInitials,
  ncaaDivisions,
  saveCollegeProfile,
  type CollegeProfile,
  type NcaaDivision,
} from "@/lib/college-profile";

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/30";

const labelClassName = "mb-1.5 block text-sm text-zinc-400";

export function CollegeSettingsForm() {
  const [settings, setSettings] = useState<CollegeProfile | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSettings(getCollegeProfile());
  }, []);

  function update<K extends keyof CollegeProfile>(
    key: K,
    value: CollegeProfile[K],
  ) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !settings) return;

    if (!file.type.startsWith("image/")) {
      setToast({
        message: "Logo must be an image file.",
        tone: "error",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setToast({
        message: "Logo must be 2MB or smaller.",
        tone: "error",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        update("logoDataUrl", reader.result);
      }
    };
    reader.onerror = () => {
      setToast({
        message: "Failed to read logo image.",
        tone: "error",
      });
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveLogo() {
    update("logoDataUrl", null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings) return;

    if (!settings.universityName.trim()) {
      setToast({
        message: "University name is required.",
        tone: "error",
      });
      return;
    }

    if (!settings.contactEmail.trim()) {
      setToast({
        message: "Contact email is required.",
        tone: "error",
      });
      return;
    }

    setSaving(true);
    try {
      const saved = saveCollegeProfile(settings);
      setSettings(saved);
      setToast({
        message: "Settings saved successfully.",
        tone: "success",
      });
    } catch {
      setToast({
        message: "Failed to save settings.",
        tone: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <div className="rounded-3xl border border-white/8 bg-zinc-900/50 px-6 py-12 text-center text-sm text-zinc-500">
        Loading settings…
      </div>
    );
  }

  const initials = getUniversityInitials(settings.universityName);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        <GlassCard className="p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="shrink-0">
              <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-br from-zinc-800 to-zinc-900 sm:h-32 sm:w-32">
                {settings.logoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.logoDataUrl}
                    alt="University logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold tracking-wide text-emerald-400/90">
                    {initials}
                  </span>
                )}
              </div>
            </div>

            <div className="w-full flex-1 text-center sm:text-left">
              <p className="mb-2 text-sm font-medium text-white">
                University Logo
              </p>
              <p className="mb-4 text-sm text-zinc-500">
                PNG or JPG up to 2MB. Optional for MVP.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/10">
                  Upload logo
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleLogoChange}
                  />
                </label>
                {settings.logoDataUrl ? (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 sm:p-8">
          <h2 className="mb-6 text-lg font-semibold tracking-tight text-white">
            Program Profile
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="universityName" className={labelClassName}>
                University Name
              </label>
              <input
                id="universityName"
                type="text"
                required
                value={settings.universityName}
                onChange={(e) => update("universityName", e.target.value)}
                className={inputClassName}
                placeholder="Stanford University"
              />
            </div>

            <div>
              <label htmlFor="ncaaDivision" className={labelClassName}>
                NCAA Division
              </label>
              <select
                id="ncaaDivision"
                value={settings.ncaaDivision}
                onChange={(e) =>
                  update("ncaaDivision", e.target.value as NcaaDivision | "")
                }
                className={inputClassName}
                style={{ colorScheme: "dark" }}
              >
                <option value="" className="bg-zinc-900 text-white">
                  Select division
                </option>
                {ncaaDivisions.map((division) => (
                  <option
                    key={division}
                    value={division}
                    className="bg-zinc-900 text-white"
                  >
                    {division}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="conference" className={labelClassName}>
                Conference
              </label>
              <input
                id="conference"
                type="text"
                value={settings.conference}
                onChange={(e) => update("conference", e.target.value)}
                className={inputClassName}
                placeholder="ACC"
              />
            </div>

            <div>
              <label htmlFor="state" className={labelClassName}>
                State
              </label>
              <input
                id="state"
                type="text"
                value={settings.state}
                onChange={(e) => update("state", e.target.value)}
                className={inputClassName}
                placeholder="CA"
              />
            </div>

            <div>
              <label htmlFor="city" className={labelClassName}>
                City
              </label>
              <input
                id="city"
                type="text"
                value={settings.city}
                onChange={(e) => update("city", e.target.value)}
                className={inputClassName}
                placeholder="Stanford"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="website" className={labelClassName}>
                Website
              </label>
              <input
                id="website"
                type="url"
                value={settings.website}
                onChange={(e) => update("website", e.target.value)}
                className={inputClassName}
                placeholder="https://..."
              />
            </div>

            <div>
              <label htmlFor="headCoach" className={labelClassName}>
                Head Coach
              </label>
              <input
                id="headCoach"
                type="text"
                value={settings.headCoach}
                onChange={(e) => update("headCoach", e.target.value)}
                className={inputClassName}
                placeholder="Coach name"
              />
            </div>

            <div>
              <label htmlFor="assistantCoach" className={labelClassName}>
                Assistant Coach (optional)
              </label>
              <input
                id="assistantCoach"
                type="text"
                value={settings.assistantCoach}
                onChange={(e) => update("assistantCoach", e.target.value)}
                className={inputClassName}
                placeholder="Assistant coach name"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="contactEmail" className={labelClassName}>
                Contact Email
              </label>
              <input
                id="contactEmail"
                type="email"
                required
                value={settings.contactEmail}
                onChange={(e) => update("contactEmail", e.target.value)}
                className={inputClassName}
                placeholder="recruiting@university.edu"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="aboutProgram" className={labelClassName}>
                About the Program
              </label>
              <textarea
                id="aboutProgram"
                rows={4}
                value={settings.aboutProgram}
                onChange={(e) => update("aboutProgram", e.target.value)}
                className={`${inputClassName} resize-y`}
                placeholder="Describe your tennis program..."
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="facilities" className={labelClassName}>
                Facilities
              </label>
              <textarea
                id="facilities"
                rows={3}
                value={settings.facilities}
                onChange={(e) => update("facilities", e.target.value)}
                className={`${inputClassName} resize-y`}
                placeholder="Courts, training spaces, support facilities..."
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="recruitingInformation" className={labelClassName}>
                Recruiting Information
              </label>
              <textarea
                id="recruitingInformation"
                rows={4}
                value={settings.recruitingInformation}
                onChange={(e) =>
                  update("recruitingInformation", e.target.value)
                }
                className={`${inputClassName} resize-y`}
                placeholder="What you look for in recruits..."
              />
            </div>
          </div>
        </GlassCard>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
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
