import { type ReactNode } from "react";

type PageTitleProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export function PageTitle({ title, description, children }: PageTitleProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-zinc-500 sm:text-base">
            {description}
          </p>
        )}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}
