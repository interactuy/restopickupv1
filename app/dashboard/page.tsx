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
      <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
        <AutoRefresh intervalMs={15000} />
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

      <section className="rounded-[1.75rem] border border-[var(--color-border)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(39,24,13,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
              Estadísticas
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Pantallazo rápido
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
              Resumen de los últimos 30 días. Desde la sección completa vas a poder
              profundizar por rango, horarios, días y top productos.
            </p>
          </div>
          <Link
            href="/dashboard/estadisticas"
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Ver estadísticas
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
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
              className="rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <p className="text-sm text-[var(--color-muted)]">{item.label}</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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
