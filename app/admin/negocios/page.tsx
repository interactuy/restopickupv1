import Link from "next/link";

import { getAdminBusinesses, requireInternalAdminContext } from "@/lib/admin/server";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export default async function AdminBusinessesPage() {
  await requireInternalAdminContext();
  const businesses = await getAdminBusinesses();

  return (
    <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
        Negocios
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Negocios activos y onboarding
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
            Esta vista junta onboarding, conexión de pagos y ventas recientes para
            tener una lectura rápida de cada local.
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-[var(--color-border)]">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-[var(--color-surface)] text-left text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              <tr>
                <th className="px-4 py-4 font-semibold">Local</th>
                <th className="px-4 py-4 font-semibold">Equipo</th>
                <th className="px-4 py-4 font-semibold">Onboarding</th>
                <th className="px-4 py-4 font-semibold">Pagos</th>
                <th className="px-4 py-4 font-semibold">Ventas 30 días</th>
                <th className="px-4 py-4 font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((business) => (
                <tr
                  key={business.id}
                  className="border-t border-[var(--color-border)] text-sm text-[var(--color-foreground)]"
                >
                  <td className="px-4 py-4 align-top">
                    <div className="font-semibold">{business.name}</div>
                    <div className="mt-1 text-[var(--color-muted)]">@{business.slug}</div>
                    <div className="mt-1 text-[var(--color-muted)]">
                      {business.contactEmail ?? "Sin email"}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-[var(--color-muted)]">
                    <div>{business.memberCounts.owners} owner</div>
                    <div>{business.memberCounts.admins} admin</div>
                    <div>{business.memberCounts.staff} staff</div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <span
                      className={
                        business.onboardingCompletedAt
                          ? "inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700"
                          : "inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-rose-700"
                      }
                    >
                      {business.onboardingCompletedAt ? "Completo" : "Pendiente"}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <span
                      className={
                        business.paymentConnectionStatus === "connected"
                          ? "inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700"
                          : business.paymentConnectionStatus === "error"
                            ? "inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-rose-700"
                            : "inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700"
                      }
                    >
                      {business.paymentConnectionStatus === "connected"
                        ? "Conectado"
                        : business.paymentConnectionStatus === "error"
                          ? "Con error"
                          : "Sin conectar"}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top text-[var(--color-muted)]">
                    <div>{business.salesLast30Days.paidOrders} pagos</div>
                    <div className="mt-1 font-medium text-[var(--color-foreground)]">
                      {formatCurrency(business.salesLast30Days.revenueAmount)}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <Link
                      href={`/admin/negocios/${business.id}`}
                      className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
