import Link from "next/link";

import {
  getDashboardOverview,
  requireCompletedDashboardContext,
} from "@/lib/dashboard/server";

export default async function DashboardHomePage() {
  const context = await requireCompletedDashboardContext();
  const overview = await getDashboardOverview(context.business.id);

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
