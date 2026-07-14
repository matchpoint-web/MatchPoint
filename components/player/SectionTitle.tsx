type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="mb-5 sm:mb-7">
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2.5 text-sm leading-relaxed text-zinc-500 sm:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}
