type DayHourHeatmapProps = {
  title: string;
  description: string;
  totalOrders: number;
  rangeLabel: string;
  rows: {
    dayLabel: string;
    hours: {
      hourLabel: string;
      count: number;
    }[];
  }[];
};

function getHeatColor(count: number, maxCount: number) {
  if (count === 0 || maxCount === 0) {
    return "bg-slate-100";
  }

  const ratio = count / maxCount;

  if (ratio >= 0.8) {
    return "bg-[var(--color-accent)]";
  }

  if (ratio >= 0.55) {
    return "bg-[color-mix(in_srgb,var(--color-accent)_78%,white)]";
  }

  if (ratio >= 0.3) {
    return "bg-[color-mix(in_srgb,var(--color-accent)_55%,white)]";
  }

  return "bg-[color-mix(in_srgb,var(--color-accent)_28%,white)]";
}

export function DayHourHeatmap({
  title,
  description,
  totalOrders,
  rangeLabel,
  rows,
}: DayHourHeatmapProps) {
  const maxCount = Math.max(
    ...rows.flatMap((row) => row.hours.map((hour) => hour.count)),
    0
  );

  return (
    <article className="rounded-[1.75rem] border border-[var(--color-border)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(39,24,13,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
        Actividad
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
        {description}
      </p>

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="mb-3 grid grid-cols-[28px_repeat(24,minmax(0,1fr))] gap-1 text-[11px] text-[var(--color-muted)]">
            <div />
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={`header-${hour}`} className="text-center">
                {hour % 6 === 0 ? `${String(hour).padStart(2, "0")}h` : ""}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {rows.map((row) => (
              <div
                key={row.dayLabel}
                className="grid grid-cols-[28px_repeat(24,minmax(0,1fr))] items-center gap-1"
              >
                <div className="text-xs font-medium text-[var(--color-muted)]">
                  {row.dayLabel}
                </div>
                {row.hours.map((hour) => (
                  <div
                    key={`${row.dayLabel}-${hour.hourLabel}`}
                    title={`${row.dayLabel} ${hour.hourLabel} · ${hour.count} pedido${hour.count === 1 ? "" : "s"}`}
                    className={`aspect-square rounded-[6px] border border-white/60 ${getHeatColor(
                      hour.count,
                      maxCount
                    )}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
          <span>Menor actividad</span>
          {["bg-slate-100", "bg-[color-mix(in_srgb,var(--color-accent)_28%,white)]", "bg-[color-mix(in_srgb,var(--color-accent)_55%,white)]", "bg-[color-mix(in_srgb,var(--color-accent)_78%,white)]", "bg-[var(--color-accent)]"].map(
            (tone) => (
              <span
                key={tone}
                className={`h-3 w-5 rounded-full ${tone}`}
              />
            )
          )}
          <span>Mayor actividad</span>
        </div>
        <p className="text-xs text-[var(--color-muted)]">
          {rangeLabel} · {totalOrders} pedido{totalOrders === 1 ? "" : "s"} usados
        </p>
      </div>

      <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
        Esta vista se vuelve más representativa a medida que entran más pedidos pagos.
      </p>
    </article>
  );
}
