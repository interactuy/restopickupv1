import Link from "next/link";

import {
  getDashboardOverview,
  type DashboardSalesRange,
  getDashboardSalesStats,
  requireCompletedDashboardContext,
} from "@/lib/dashboard/server";
import { formatPrice } from "@/lib/public-catalog";

type DashboardHomePageProps = {
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

export default async function DashboardHomePage({
  searchParams,
}: DashboardHomePageProps) {
  const context = await requireCompletedDashboardContext();
  const range = getSalesRange((await searchParams).range);
  const [overview, salesStats] = await Promise.all([
    getDashboardOverview(context.business.id),
    getDashboardSalesStats(context.business.id, context.business.timezone, range),
  ]);

  return (
    <>
      <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
          Dashboard
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--color-foreground)]">
          Operación de {context.business.name}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
          Desde acá podés seguir pedidos reales, revisar catálogo y ajustar datos
          básicos del local.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          {
            label: "Pedidos activos",
            value: String(overview.pendingOrders),
          },
          {
            label: "Listos para retirar",
            value: String(overview.readyOrders),
          },
          {
            label: "Productos disponibles",
            value: `${overview.availableProducts}/${overview.totalProducts}`,
          },
        ].map((item) => (
          <article
            key={item.label}
            className="rounded-[1.75rem] border border-[var(--color-border)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(39,24,13,0.08)]"
          >
            <p className="text-sm text-[var(--color-muted)]">{item.label}</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-[var(--color-foreground)]">
              {item.value}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <article className="rounded-[1.75rem] border border-[var(--color-border)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(39,24,13,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                Estadísticas
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
                Rendimiento del local
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {salesRangeOptions.map((option) => {
                const isActive = range === option.value;
                return (
                  <Link
                    key={option.value}
                    href={`/dashboard?range=${option.value}`}
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
          <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
            {salesStats.rangeLabel} · {salesStats.totalPaidOrders} pedido
            {salesStats.totalPaidOrders === 1 ? "" : "s"} cobrados
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
              <div
                key={item.label}
                className="rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <p className="text-sm text-[var(--color-muted)]">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-7 text-[var(--color-muted)]">
            Métricas armadas sobre pedidos pagados para que el panel refleje actividad
            real del negocio.
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-[var(--color-border)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(39,24,13,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
            Top productos
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Lo que más se vende
          </h2>

          {salesStats.topProducts.length === 0 ? (
            <p className="mt-5 text-sm leading-7 text-[var(--color-muted)]">
              Cuando entren pedidos pagados vas a ver acá cuáles empujan más la venta.
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

          <p className="mt-5 text-sm leading-7 text-[var(--color-muted)]">
            Útil para decidir qué destacar en la portada o qué conviene mantener siempre disponible.
          </p>
        </article>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          {
            href: "/dashboard/pedidos",
            title: "Gestionar pedidos",
            description: "Cambiar estados y seguir el flujo operativo del local.",
          },
          {
            href: "/dashboard/productos",
            title: "Revisar catálogo",
            description: "Activar o desactivar productos en segundos.",
          },
          {
            href: "/dashboard/configuracion",
            title: "Configurar local",
            description: "Actualizar dirección, contacto e instrucciones de retiro.",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[1.75rem] border border-[var(--color-border)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(39,24,13,0.08)] transition hover:-translate-y-1"
          >
            <h2 className="text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
              {item.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              {item.description}
            </p>
          </Link>
        ))}
      </section>
    </>
  );
}
