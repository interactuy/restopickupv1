import type { AdminDayHourHeatmap, AdminSalesSeriesPoint } from "@/lib/admin/server";

type AdminMetricProps = {
  label: string;
  value: string | number;
  detail?: string;
};

type AdminHeatmapProps = {
  title: string;
  description?: string;
  heatmap: AdminDayHourHeatmap;
};

type AdminSalesBarsProps = {
  title: string;
  description?: string;
  items: AdminSalesSeriesPoint[];
};

type AdminRevenueLineChartProps = {
  title: string;
  description?: string;
  items: AdminSalesSeriesPoint[];
};

function formatChartCurrency(amount: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getHeatTone(count: number, maxCount: number) {
  if (count === 0 || maxCount === 0) {
    return "bg-slate-100";
  }

  const ratio = count / maxCount;

  if (ratio >= 0.8) {
    return "bg-emerald-600";
  }

  if (ratio >= 0.55) {
    return "bg-emerald-500";
  }

  if (ratio >= 0.3) {
    return "bg-emerald-300";
  }

  return "bg-emerald-100";
}

export function AdminMetric({ label, value, detail }: AdminMetricProps) {
  return (
    <article className="border-r border-slate-200 px-5 py-4 last:border-r-0">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      {detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}
    </article>
  );
}

export function AdminHeatmap({ title, description, heatmap }: AdminHeatmapProps) {
  const maxCount = Math.max(
    ...heatmap.rows.flatMap((row) => row.hours.map((hour) => hour.count)),
    0
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
            {description ? (
              <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
            ) : null}
          </div>
          <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600">
            {heatmap.totalOrders} pedidos
          </span>
        </div>
      </div>

      <div className="overflow-x-auto px-5 py-4">
        <div className="min-w-[720px]">
          <div className="mb-2 grid grid-cols-[28px_repeat(24,minmax(0,1fr))] gap-1 text-[10px] text-slate-400">
            <div />
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="text-center">
                {hour % 6 === 0 ? `${String(hour).padStart(2, "0")}` : ""}
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {heatmap.rows.map((row) => (
              <div
                key={row.dayLabel}
                className="grid grid-cols-[28px_repeat(24,minmax(0,1fr))] items-center gap-1"
              >
                <div className="text-[11px] font-medium text-slate-500">
                  {row.dayLabel}
                </div>
                {row.hours.map((hour) => (
                  <div
                    key={`${row.dayLabel}-${hour.hourLabel}`}
                    title={`${row.fullDayLabel} · ${hour.hourLabel} · ${hour.count} pedido${hour.count === 1 ? "" : "s"}`}
                    className={`h-4 rounded-[4px] transition-colors ${getHeatTone(
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

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>Menos</span>
          <span className="h-2.5 w-5 rounded-sm bg-slate-100" />
          <span className="h-2.5 w-5 rounded-sm bg-emerald-100" />
          <span className="h-2.5 w-5 rounded-sm bg-emerald-300" />
          <span className="h-2.5 w-5 rounded-sm bg-emerald-500" />
          <span className="h-2.5 w-5 rounded-sm bg-emerald-600" />
          <span>Más</span>
        </div>
        <span>Hover para ver día, hora y cantidad.</span>
      </div>
    </section>
  );
}

export function AdminSalesBars({ title, description, items }: AdminSalesBarsProps) {
  const maxValue = Math.max(...items.map((item) => item.revenueAmount), 0);
  const totalValue = items.reduce((sum, item) => sum + item.revenueAmount, 0);
  const maxBarHeight = 170;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
          ) : null}
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          {formatChartCurrency(totalValue)}
        </span>
      </div>
      <div className="relative flex h-56 items-end gap-1 px-5 py-4">
        {maxValue === 0 ? (
          <div className="absolute inset-5 grid place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 text-center">
            <div>
              <p className="text-sm font-medium text-slate-700">Sin GMV en este período</p>
              <p className="mt-1 text-xs text-slate-500">
                Solo se cuentan pedidos con pago aprobado o autorizado.
              </p>
            </div>
          </div>
        ) : null}
        {items.map((item) => {
          const height =
            maxValue === 0 ? 2 : Math.max(6, (item.revenueAmount / maxValue) * maxBarHeight);

          return (
            <div
              key={item.label}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
            >
              <div
                title={`${item.label} · ${item.paidOrders} pedidos · ${formatChartCurrency(
                  item.revenueAmount
                )}`}
                className={`w-full rounded-t-md transition-all duration-500 ${
                  item.revenueAmount > 0 ? "bg-emerald-600" : "bg-slate-200"
                }`}
                style={{
                  height,
                }}
              />
              <span className="hidden rotate-[-45deg] text-[10px] text-slate-400 md:block">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function AdminRevenueLineChart({
  title,
  description,
  items,
}: AdminRevenueLineChartProps) {
  const width = 640;
  const height = 190;
  const paddingX = 32;
  const paddingY = 24;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  const maxValue = Math.max(...items.map((item) => item.revenueAmount), 0);
  const totalValue = items.reduce((sum, item) => sum + item.revenueAmount, 0);
  const points = items.map((item, index) => {
    const x = paddingX + (items.length <= 1 ? 0 : (index / (items.length - 1)) * chartWidth);
    const y =
      paddingY +
      (maxValue === 0 ? chartHeight : chartHeight - (item.revenueAmount / maxValue) * chartHeight);

    return {
      ...item,
      x,
      y,
    };
  });
  const linePath = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
          ) : null}
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          {formatChartCurrency(totalValue)}
        </span>
      </div>

      <div className="overflow-x-auto px-5 py-4">
        <div className="relative min-w-[760px]">
          {maxValue === 0 ? (
            <div className="absolute inset-x-8 top-12 z-10 rounded-xl border border-dashed border-slate-200 bg-slate-50/90 px-4 py-5 text-center">
              <p className="text-sm font-medium text-slate-700">Todavía no hay GMV mensual</p>
              <p className="mt-1 text-xs text-slate-500">
                Cuando entren pagos aprobados, la línea empieza a dibujar crecimiento.
              </p>
            </div>
          ) : null}
          <svg
            role="img"
            aria-label={title}
            viewBox={`0 0 ${width} ${height}`}
            className="h-[220px] w-full"
          >
            <defs>
              <linearGradient id="adminRevenueFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3].map((line) => {
              const y = paddingY + (line / 3) * chartHeight;

              return (
                <line
                  key={line}
                  x1={paddingX}
                  x2={width - paddingX}
                  y1={y}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray={line === 3 ? "0" : "4 6"}
                />
              );
            })}
            {points.length > 1 ? (
              <polygon
                points={`${paddingX},${height - paddingY} ${linePath} ${
                  width - paddingX
                },${height - paddingY}`}
                fill="url(#adminRevenueFill)"
              />
            ) : null}
            {points.length > 1 ? (
              <polyline
                points={linePath}
                fill="none"
                stroke="#059669"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
            ) : null}
            {points.map((point) => (
              <g key={point.label}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  fill="#ffffff"
                  r="5"
                  stroke="#059669"
                  strokeWidth="2"
                >
                  <title>
                    {point.label} · {point.paidOrders} pedidos ·{" "}
                    {formatChartCurrency(point.revenueAmount)}
                  </title>
                </circle>
                <text
                  x={point.x}
                  y={height - 4}
                  fill="#64748b"
                  fontSize="11"
                  textAnchor="middle"
                >
                  {point.label}
                </text>
              </g>
            ))}
            <text x={paddingX} y="16" fill="#64748b" fontSize="11">
              {formatChartCurrency(maxValue)}
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}
