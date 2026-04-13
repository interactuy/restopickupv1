import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type AccordionSectionProps = {
  title: string;
  description?: string;
  badge?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  contentClassName?: string;
};

export function AccordionSection({
  title,
  description,
  badge,
  defaultOpen = false,
  children,
  contentClassName = "px-5 py-5",
}: AccordionSectionProps) {
  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 marker:hidden [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
              {title}
            </h2>
            {badge ? (
              <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
                {badge}
              </span>
            ) : null}
          </div>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
              {description}
            </p>
          ) : null}
        </div>

        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] transition group-open:rotate-180">
          <ChevronDown className="h-4 w-4" />
        </span>
      </summary>

      <div className={`border-t border-[var(--color-border)] ${contentClassName}`}>
        {children}
      </div>
    </details>
  );
}
