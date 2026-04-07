type SimpleBarChartProps = {
  title: string;
  description: string;
  items: {
    label: string;
    value: number;
  }[];
};

export function SimpleBarChart({
  title,
  description,
  items,
}: SimpleBarChartProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 0);

  return (
    <article className="rounded-[1.75rem] border border-[var(--color-border)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(39,24,13,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
        Tendencia
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
        {description}
      </p>

      {items.length === 0 ? (
        <p className="mt-5 text-sm leading-7 text-[var(--color-muted)]">
          Todavía no hay suficientes pedidos pagos para dibujar esta gráfica.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-[var(--color-foreground)]">
                  {item.label}
                </span>
                <span className="text-[var(--color-muted)]">{item.value}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[var(--color-surface)]">
                <div
                  className="h-full rounded-full bg-[var(--color-accent)]"
                  style={{
                    width:
                      maxValue === 0
                        ? "0%"
                        : `${Math.max(8, (item.value / maxValue) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
