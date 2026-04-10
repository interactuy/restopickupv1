import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

type AdminPanelProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
};

type AdminStatusPillProps = {
  tone?: "neutral" | "success" | "warning" | "danger";
  children: ReactNode;
};

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function AdminPanel({
  title,
  description,
  children,
  action,
}: AdminPanelProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {title || description || action ? (
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            {title ? (
              <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function AdminStatusPill({
  tone = "neutral",
  children,
}: AdminStatusPillProps) {
  const classes = {
    neutral: "border-slate-200 bg-white text-slate-600",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] ${classes[tone]}`}
    >
      {children}
    </span>
  );
}

export const adminTableClasses = {
  table: "min-w-full bg-white text-left text-sm",
  thead:
    "border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500",
  th: "px-4 py-3 font-medium",
  row: "border-b border-slate-200 text-slate-700 hover:bg-slate-50",
  td: "px-4 py-3 align-top",
};
