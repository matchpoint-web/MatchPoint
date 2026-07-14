"use client";

import {
  defaultFilters,
  filterOptions,
  type PlayerFilters,
} from "@/lib/mock-players";

type PlayerSearchFiltersProps = {
  filters: PlayerFilters;
  onChange: (filters: PlayerFilters) => void;
  onClear: () => void;
  activeCount: number;
};

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-200 outline-none transition-colors hover:border-white/15 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-zinc-900">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function rangeLabel(
  ranges: { value: string; label: string }[],
  value: string,
): string {
  return ranges.find((r) => r.value === value)?.label ?? value;
}

export function PlayerSearchFilters({
  filters,
  onChange,
  onClear,
  activeCount,
}: PlayerSearchFiltersProps) {
  function update<K extends keyof PlayerFilters>(key: K, value: PlayerFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  const activeChips: { label: string; clear: () => void }[] = [];

  if (filters.country)
    activeChips.push({
      label: filters.country,
      clear: () => update("country", ""),
    });
  if (filters.graduationYear)
    activeChips.push({
      label:
        filters.graduationYear === "Other"
          ? "Other Grad Year"
          : `Class of ${filters.graduationYear}`,
      clear: () => update("graduationYear", ""),
    });
  if (filters.utrRange)
    activeChips.push({
      label: `UTR ${rangeLabel(filterOptions.utrRanges, filters.utrRange)}`,
      clear: () => update("utrRange", ""),
    });
  if (filters.gpaRange)
    activeChips.push({
      label: `GPA ${rangeLabel(filterOptions.gpaRanges, filters.gpaRange)}`,
      clear: () => update("gpaRange", ""),
    });
  if (filters.division)
    activeChips.push({
      label: filters.division,
      clear: () => update("division", ""),
    });
  if (filters.handedness)
    activeChips.push({
      label: filters.handedness,
      clear: () => update("handedness", ""),
    });
  if (filters.major)
    activeChips.push({
      label: filters.major,
      clear: () => update("major", ""),
    });
  if (filters.academicTest)
    activeChips.push({
      label: filters.academicTest,
      clear: () => update("academicTest", ""),
    });
  if (filters.heightRange)
    activeChips.push({
      label: rangeLabel(filterOptions.heightRanges, filters.heightRange),
      clear: () => update("heightRange", ""),
    });

  return (
    <div className="rounded-3xl border border-white/8 bg-gradient-to-b from-zinc-900/70 to-zinc-950/80 p-5 backdrop-blur-xl sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-white">
            Filters
          </h2>
          {activeCount > 0 && (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
              {activeCount} active
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
        >
          Clear Filters
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <FilterSelect
          label="Country"
          value={filters.country}
          onChange={(v) => update("country", v)}
          options={[
            { value: "", label: "All Countries" },
            ...filterOptions.countries.map((c) => ({ value: c, label: c })),
          ]}
        />

        <FilterSelect
          label="Graduation Year"
          value={filters.graduationYear}
          onChange={(v) => update("graduationYear", v)}
          options={[
            { value: "", label: "All Years" },
            ...filterOptions.graduationYears.map((y) => ({
              value: y,
              label: y,
            })),
          ]}
        />

        <FilterSelect
          label="UTR Range"
          value={filters.utrRange}
          onChange={(v) => update("utrRange", v)}
          options={filterOptions.utrRanges}
        />

        <FilterSelect
          label="GPA"
          value={filters.gpaRange}
          onChange={(v) => update("gpaRange", v)}
          options={filterOptions.gpaRanges}
        />

        <FilterSelect
          label="Preferred Division"
          value={filters.division}
          onChange={(v) => update("division", v)}
          options={[
            { value: "", label: "All Divisions" },
            ...filterOptions.divisions.map((d) => ({ value: d, label: d })),
          ]}
        />

        <FilterSelect
          label="Handedness"
          value={filters.handedness}
          onChange={(v) => update("handedness", v)}
          options={[
            { value: "", label: "Any" },
            ...filterOptions.handedness.map((h) => ({ value: h, label: h })),
          ]}
        />

        <FilterSelect
          label="Academic Major"
          value={filters.major}
          onChange={(v) => update("major", v)}
          options={[
            { value: "", label: "All Majors" },
            ...filterOptions.majors.map((m) => ({ value: m, label: m })),
          ]}
        />

        <FilterSelect
          label="Academic Tests"
          value={filters.academicTest}
          onChange={(v) => update("academicTest", v)}
          options={[
            { value: "", label: "Any Test" },
            ...filterOptions.academicTests.map((t) => ({ value: t, label: t })),
          ]}
        />

        <FilterSelect
          label="Height"
          value={filters.heightRange}
          onChange={(v) => update("heightRange", v)}
          options={filterOptions.heightRanges}
        />
      </div>

      {activeChips.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-white/5 pt-5">
          {activeChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.clear}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/15"
            >
              {chip.label}
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { defaultFilters };
