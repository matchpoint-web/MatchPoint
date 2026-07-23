import {
  isOptionalProfilePlaceholder,
} from "@/lib/player-profile";
import { GlassCard } from "../GlassCard";

type AboutSectionProps = {
  text: string;
};

export function AboutSection({ text }: AboutSectionProps) {
  const isPlaceholder = isOptionalProfilePlaceholder(text);

  return (
    <GlassCard className="p-6 sm:p-8 lg:p-10">
      <p className="text-lg leading-relaxed text-zinc-300 sm:text-xl sm:leading-relaxed">
        {isPlaceholder ? text : <>&ldquo;{text}&rdquo;</>}
      </p>
    </GlassCard>
  );
}
