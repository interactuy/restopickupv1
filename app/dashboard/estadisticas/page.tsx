import Link from "next/link";

import { DayHourHeatmap } from "@/components/dashboard/day-hour-heatmap";
import { formatPrice } from "@/lib/public-catalog";
import {
  getDashboardSalesStats,
  type DashboardSalesRange,
  requireAdminDashboardContext,
} from "@/lib/dashboard/server";

type DashboardStatisticsPageProps = {
  searchParams: Promise<{
    range?: string;
  }>;
};

const salesRangeOptions: Array<{ value: DashboardSalesRange; label: string }> = [
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" },
  { value: "all", label: "Histórico" },
];

function getSalesRange(range?: string): DashboardSalesRange {
  if (range === "7d" || range === "all") {
    return range;
  }

  return "30d";
}

export default async function DashboardStatisticsPage({
  searchParams,
}: DashboardStatisticsPageProps) {
  const context = await requireAdminDashboardContext("/dashboard/estadisticas");
  const range = getSalesRange((await searchParams).range);
  const salesStats = await getDashboardSalesStats(
    context.business.id,
    context.business.timezone,
    range
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
              Estadísticas
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Rendimiento de {context.business.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
              Métricas construidas con pedidos pagos reales para entender ventas,
              horarios fuertes y comportamiento del menú.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {salesRangeOptions.map((option) => {
              const isActive = range === option.value;
              return (
                <Link
                  key={option.value}
                  href={`/dashboard/estadisticas?range=${option.value}`}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[var(--color-accent)] text-white"
                      : "border border-[var(--color-border)] bg-white text-[var(--color-foreground)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  }`}
                >
                  {option.label}
                </Link>
              );
            })}
          </div>
        </div>
        <p className="mt-5 text-sm leading-7 text-[var(--color-muted)]">
          {salesStats.rangeLabel} · {salesStats.totalPaidOrders} pedido
          {salesStats.totalPaidOrders === 1 ? "" : "s"} cobrados
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Ventas cobradas",
            value: formatPrice(
              salesStats.grossRevenueAmount,
              context.business.currencyCode
            ),
          },
          {
            label: "Ticket promedio",
            value: formatPrice(
              salesStats.averageTicketAmount,
              context.business.currencyCode
            ),
          },
          {
            label: "Hora con más ventas",
            value: salesStats.busiestHourLabel ?? "Sin datos",
          },
          {
            label: "Día más fuerte",
            value: salesStats.busiestWeekdayLabel ?? "Sin datos",
          },
        ].map((item) => (
          <article
            key={item.label}
            className="rounded-[1.75rem] border border-[var(--color-border)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(39,24,13,0.08)]"
          >
            <p className="text-sm text-[var(--color-muted)]">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
              {item.value}
            </p>
          </article>
        ))}
      </section>

      <DayHourHeatmap
        title="Actividad por día y hora"
        description="Te ayuda a detectar patrones combinados, como picos de viernes noche o mediodías fuertes."
        totalOrders={salesStats.totalPaidOrders}
        rangeLabel={salesStats.rangeLabel}
        rows={salesStats.dayHourHeatmap}
      />

      <section className="rounded-[1.75rem] border border-[var(--color-border)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(39,24,13,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
          Top productos
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
          Lo que más se vende
        </h2>

        {salesStats.topProducts.length === 0 ? (
          <p className="mt-5 text-sm leading-7 text-[var(--color-muted)]">
            Cuando entren pedidos pagos vas a ver acá qué productos empujan más la venta.
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {salesStats.topProducts.map((product, index) => (
              <div
                key={`${product.name}-${index}`}
                className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--color-foreground)]">
                    {product.name}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {product.quantity} unidades vendidas
                  </p>
                </div>
                <p className="text-sm font-semibold text-[var(--color-foreground)]">
                  {formatPrice(product.revenueAmount, context.business.currencyCode)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
