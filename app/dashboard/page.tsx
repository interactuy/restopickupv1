import Link from "next/link";
import { redirect } from "next/navigation";

import { AutoRefresh } from "@/components/live/auto-refresh";
import { formatPrice } from "@/lib/public-catalog";
import {
  getDashboardOverview,
  getDashboardSalesStats,
  requireDashboardContext,
} from "@/lib/dashboard/server";

export default async function DashboardHomePage() {
  const context = await requireDashboardContext();

  if (!context.business.onboardingCompletedAt) {
    redirect("/dashboard/onboarding");
  }

  if (!context.membership.isAdminRole || !context.isAdminModeEnabled) {
    redirect("/dashboard/pedidos");
  }

  const [overview, salesStats] = await Promise.all([
    getDashboardOverview(context.business.id),
    getDashboardSalesStats(context.business.id, context.business.timezone, "30d"),
  ]);

  return (
    <>
      <section className="border-b border-[var(--color-border)] pb-4">
        <AutoRefresh intervalMs={15000} />
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
          Operación
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
          Operación de {context.business.name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
          Desde acá podés seguir pedidos reales, revisar catálogo y ajustar datos
          básicos del local.
        </p>
      </section>

      <section className="grid overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white md:grid-cols-2 xl:grid-cols-3">
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
            className="border-b border-[var(--color-border)] p-6 last:border-b-0 md:border-b-0 md:border-r last:md:border-r-0"
          >
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-muted)]">
              {item.label}
            </p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-[var(--color-foreground)]">
              {item.value}
            </p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
              Estadísticas
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Pantallazo rápido
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
              Resumen de los últimos 30 días. Desde la sección completa vas a poder
              profundizar por rango, horarios, días y top productos.
            </p>
          </div>
          <Link
            href="/dashboard/estadisticas"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-accent-hover)]"
          >
            Ver estadísticas
          </Link>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4">
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
              label: "Hora pico",
              value: salesStats.busiestHourLabel ?? "Sin datos",
            },
            {
              label: "Mejor día",
              value: salesStats.busiestWeekdayLabel ?? "Sin datos",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="border-b border-[var(--color-border)] bg-white px-5 py-4 last:border-b-0 md:border-b-0 md:border-r last:md:border-r-0"
            >
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-muted)]">
                {item.label}
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
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
            href: "/dashboard/estadisticas",
            title: "Analizar ventas",
            description: "Ver horas pico, ticket promedio y productos más vendidos.",
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
            className="rounded-2xl border border-[var(--color-border)] bg-white p-6 transition hover:bg-[var(--color-surface-strong)]"
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
