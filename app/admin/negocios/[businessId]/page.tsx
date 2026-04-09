import Link from "next/link";
import { notFound } from "next/navigation";

import { getAdminBusinessById, requireInternalAdminContext } from "@/lib/admin/server";

type AdminBusinessDetailPageProps = {
  params: Promise<{
    businessId: string;
  }>;
};

function formatCurrency(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export default async function AdminBusinessDetailPage({
  params,
}: AdminBusinessDetailPageProps) {
  await requireInternalAdminContext();
  const { businessId } = await params;
  const business = await getAdminBusinessById(businessId);

  if (!business) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
              Negocio
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
              {business.name}
            </h1>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              @{business.slug} · {business.pickupAddress}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/locales/${business.slug}`}
              className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Ver menú público
            </Link>
            {business.approvedApplicationId ? (
              <Link
                href={`/admin/solicitudes/${business.approvedApplicationId}`}
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Ver solicitud
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Onboarding
            </p>
            <p className="mt-3 text-2xl font-semibold text-[var(--color-foreground)]">
              {business.onboardingCompletedAt ? "Completo" : "Pendiente"}
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {business.onboardingCompletedAt
                ? `Listo desde ${new Date(business.onboardingCompletedAt).toLocaleString("es-UY")}`
                : "Todavía no terminó la configuración inicial"}
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Pagos
            </p>
            <p className="mt-3 text-2xl font-semibold text-[var(--color-foreground)]">
              {business.paymentConnection.status === "connected" ? "Conectado" : "Pendiente"}
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {business.paymentConnection.status === "connected"
                ? `Conectado ${business.paymentConnection.connectedAt ? new Date(business.paymentConnection.connectedAt).toLocaleString("es-UY") : ""}`
                : "Todavía no conectó su cuenta de Mercado Pago"}
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Ventas 7 días
            </p>
            <p className="mt-3 text-2xl font-semibold text-[var(--color-foreground)]">
              {formatCurrency(business.salesLast7Days.revenueAmount, business.currencyCode)}
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {business.salesLast7Days.paidOrders} pagos cobrados
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Ticket promedio
            </p>
            <p className="mt-3 text-2xl font-semibold text-[var(--color-foreground)]">
              {formatCurrency(
                business.salesLast30Days.averageTicketAmount,
                business.currencyCode
              )}
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Calculado sobre pagos de los últimos 30 días
            </p>
          </article>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6">
          <article className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Datos del local
            </h2>
            <dl className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Contacto
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-foreground)]">
                  {business.contactEmail ?? "Sin email"} {business.contactPhone ? `· ${business.contactPhone}` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Estado público
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-foreground)]">
                  {business.isActive ? "Activo" : "Inactivo"}
                  {business.isTemporarilyClosed ? " · Cerrado temporalmente" : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Zona horaria
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-foreground)]">
                  {business.timezone}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Moneda
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-foreground)]">
                  {business.currencyCode}
                </dd>
              </div>
            </dl>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Descripción
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-foreground)]">
                  {business.description ?? "Todavía no configuró una descripción del local."}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Instrucciones de retiro
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-foreground)]">
                  {business.pickupInstructions ?? "Todavía no configuró instrucciones de retiro."}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Horario visible
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-foreground)]">
                  {business.businessHoursText ?? "Sin texto manual adicional."}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Pedidos pagos recientes
            </h2>

            {business.recentPaidOrders.length === 0 ? (
              <div className="mt-6 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm text-[var(--color-muted)]">
                Todavía no hay pedidos pagos para este local.
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {business.recentPaidOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-foreground)]">
                          Pedido #{order.orderNumber ?? "—"} · {order.customerName}
                        </p>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">
                          {new Date(order.placedAt).toLocaleString("es-UY")}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-[var(--color-foreground)]">
                          {formatCurrency(order.totalAmount, business.currencyCode)}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
                          {order.paymentStatus} · {order.statusCode}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>

        <section className="space-y-6">
          <article className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Equipo y acceso
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Owners
                </p>
                <p className="mt-3 text-2xl font-semibold text-[var(--color-foreground)]">
                  {business.memberCounts.owners}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Admins
                </p>
                <p className="mt-3 text-2xl font-semibold text-[var(--color-foreground)]">
                  {business.memberCounts.admins}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Staff
                </p>
                <p className="mt-3 text-2xl font-semibold text-[var(--color-foreground)]">
                  {business.memberCounts.staff}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Estado de pagos
            </h2>
            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Estado
                </dt>
                <dd className="mt-1 text-[var(--color-foreground)]">
                  {business.paymentConnection.status}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Usuario Mercado Pago
                </dt>
                <dd className="mt-1 text-[var(--color-foreground)]">
                  {business.paymentConnection.mercadopagoUserId ?? "Sin conectar"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Modo
                </dt>
                <dd className="mt-1 text-[var(--color-foreground)]">
                  {business.paymentConnection.liveMode ? "Producción" : "Pruebas"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Conectado el
                </dt>
                <dd className="mt-1 text-[var(--color-foreground)]">
                  {business.paymentConnection.connectedAt
                    ? new Date(business.paymentConnection.connectedAt).toLocaleString("es-UY")
                    : "Sin fecha"}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Ventas del negocio
            </h2>
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Últimos 30 días
                </p>
                <p className="mt-3 text-2xl font-semibold text-[var(--color-foreground)]">
                  {formatCurrency(business.salesLast30Days.revenueAmount, business.currencyCode)}
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {business.salesLast30Days.paidOrders} pagos · ticket promedio{" "}
                  {formatCurrency(
                    business.salesLast30Days.averageTicketAmount,
                    business.currencyCode
                  )}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Histórico
                </p>
                <p className="mt-3 text-2xl font-semibold text-[var(--color-foreground)]">
                  {formatCurrency(business.salesAllTime.revenueAmount, business.currencyCode)}
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {business.salesAllTime.paidOrders} pagos acumulados
                </p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
