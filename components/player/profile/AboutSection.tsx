import { GlassCard } from "../GlassCard";

type AboutSectionProps = {
  text: string;
};

export function AboutSection({ text }: AboutSectionProps) {
  return (
    <GlassCard className="p-6 sm:p-8 lg:p-10">
      <p className="text-lg leading-relaxed text-zinc-300 sm:text-xl sm:leading-relaxed">
        &ldquo;{text}&rdquo;
      </p>
    </GlassCard>
  );
}
