import Link from "next/link";

import {
  getAdminBusinesses,
  getAdminOverview,
  getBusinessApplications,
  requireInternalAdminContext,
} from "@/lib/admin/server";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export default async function AdminIndexPage() {
  await requireInternalAdminContext();
  const [overview, pendingApplications, businesses] = await Promise.all([
    getAdminOverview(),
    getBusinessApplications("pending"),
    getAdminBusinesses(),
  ]);

  const recentBusinesses = businesses.slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
          Resumen interno
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Panel de operaciones
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
              Desde acá pueden revisar solicitudes, monitorear negocios ya activos
              y tener una lectura rápida de onboarding, pagos y ventas recientes.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/solicitudes?status=pending"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Ver pendientes
            </Link>
            <Link
              href="/admin/negocios"
              className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Ver negocios
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Solicitudes
            </p>
            <p className="mt-3 text-3xl font-semibold text-[var(--color-foreground)]">
              {overview.applications.pending}
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Pendientes de revisión
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Negocios
            </p>
            <p className="mt-3 text-3xl font-semibold text-[var(--color-foreground)]">
              {overview.businesses.total}
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {overview.businesses.active} activos, {overview.businesses.onboardingCompleted} con onboarding listo
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Pagos conectados
            </p>
            <p className="mt-3 text-3xl font-semibold text-[var(--color-foreground)]">
              {overview.businesses.connectedPayments}
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Negocios cobrando con su propia cuenta
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Ventas 30 días
            </p>
            <p className="mt-3 text-3xl font-semibold text-[var(--color-foreground)]">
              {formatCurrency(overview.salesLast30Days.revenueAmount)}
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {overview.salesLast30Days.paidOrders} pagos cobrados
            </p>
          </article>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                Solicitudes pendientes
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
                Próximos locales a revisar
              </h2>
            </div>

            <Link
              href="/admin/solicitudes?status=pending"
              className="text-sm font-semibold text-[var(--color-accent)]"
            >
              Ver todas
            </Link>
          </div>

          {pendingApplications.length === 0 ? (
            <div className="mt-6 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm text-[var(--color-muted)]">
              No hay solicitudes pendientes ahora mismo.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {pendingApplications.slice(0, 5).map((application) => (
                <Link
                  key={application.id}
                  href={`/admin/solicitudes/${application.id}`}
                  className="block rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:border-[var(--color-accent)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--color-foreground)]">
                        {application.businessName}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        {application.contactName} · {application.email}
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                      Pendiente
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[var(--color-muted)]">
                    {application.city ?? "Sin ciudad"} · {application.businessType ?? "Sin tipo"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                Negocios recientes
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
                Estado general por local
              </h2>
            </div>

            <Link
              href="/admin/negocios"
              className="text-sm font-semibold text-[var(--color-accent)]"
            >
              Ver todos
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {recentBusinesses.map((business) => (
              <Link
                key={business.id}
                href={`/admin/negocios/${business.id}`}
                className="flex flex-wrap items-start justify-between gap-3 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:border-[var(--color-accent)]"
              >
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-foreground)]">
                    {business.name}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">@{business.slug}</p>
                  <p className="mt-3 text-sm text-[var(--color-muted)]">
                    {business.salesLast30Days.paidOrders} pagos en 30 días ·{" "}
                    {formatCurrency(business.salesLast30Days.revenueAmount)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={
                      business.paymentConnectionStatus === "connected"
                        ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700"
                        : "rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700"
                    }
                  >
                    {business.paymentConnectionStatus === "connected"
                      ? "Pagos conectados"
                      : "Pagos pendientes"}
                  </span>
                  <span
                    className={
                      business.onboardingCompletedAt
                        ? "rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700"
                        : "rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-rose-700"
                    }
                  >
                    {business.onboardingCompletedAt ? "Onboarding listo" : "Onboarding pendiente"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
