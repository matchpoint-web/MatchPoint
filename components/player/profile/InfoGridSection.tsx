import { StatCard } from "../StatCard";

type InfoGridSectionProps = {
  items: { label: string; value: string }[];
};

export function InfoGridSection({ items }: InfoGridSectionProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
      {items.map((item) => (
        <StatCard key={item.label} label={item.label} value={item.value} />
      ))}
    </div>
  );
}
