"use client";

import {
  collegeFilterOptions,
  type CollegeFilters,
} from "@/lib/colleges";

type CollegeSearchFiltersProps = {
  filters: CollegeFilters;
  onChange: (filters: CollegeFilters) => void;
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
        className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-200 outline-none transition-colors hover:border-white/15 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
        style={{ colorScheme: "dark" }}
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-zinc-900 text-white"
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CollegeSearchFilters({
  filters,
  onChange,
  onClear,
  activeCount,
}: CollegeSearchFiltersProps) {
  function update<K extends keyof CollegeFilters>(
    key: K,
    value: CollegeFilters[K],
  ) {
    onChange({ ...filters, [key]: value });
  }

  const activeChips: { label: string; clear: () => void }[] = [];

  if (filters.division) {
    activeChips.push({
      label: filters.division,
      clear: () => update("division", ""),
    });
  }
  if (filters.utrRange) {
    const label =
      collegeFilterOptions.utrRanges.find((r) => r.value === filters.utrRange)
        ?.label ?? filters.utrRange;
    activeChips.push({
      label: label,
      clear: () => update("utrRange", ""),
    });
  }

  return (
    <div className="space-y-4 rounded-3xl border border-white/8 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <FilterSelect
          label="Division"
          value={filters.division}
          onChange={(value) => update("division", value)}
          options={collegeFilterOptions.divisions}
        />
        <FilterSelect
          label="Average Team UTR"
          value={filters.utrRange}
          onChange={(value) => update("utrRange", value)}
          options={collegeFilterOptions.utrRanges}
        />
      </div>

      {(activeCount > 0 || activeChips.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.clear}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/15"
            >
              {chip.label}
              <span aria-hidden>×</span>
            </button>
          ))}
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-zinc-500 transition hover:text-zinc-300"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
