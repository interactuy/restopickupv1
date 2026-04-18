import Link from "next/link";

import {
  getAdminBusinesses,
  getAdminOverview,
  getBusinessApplications,
  requireInternalAdminContext,
} from "@/lib/admin/server";
import { AdminHeatmap, AdminMetric, AdminSalesBars } from "@/components/admin/admin-charts";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(bps: number) {
  return `${(bps / 100).toFixed(2).replace(/\.00$/, "")}%`;
}

export default async function AdminIndexPage() {
  await requireInternalAdminContext("/admin");
  const [overview, pendingApplications, businesses] = await Promise.all([
    getAdminOverview(),
    getBusinessApplications("pending"),
    getAdminBusinesses(),
  ]);

  const watchlist = [...businesses]
    .sort((a, b) => {
      const aScore =
        (a.paymentConnectionStatus !== "connected" ? 1000 : 0) +
        (!a.onboardingCompletedAt ? 800 : 0) +
        (a.platformStatus !== "active" ? 600 : 0) -
        a.salesLast30Days.revenueAmount;
      const bScore =
        (b.paymentConnectionStatus !== "connected" ? 1000 : 0) +
        (!b.onboardingCompletedAt ? 800 : 0) +
        (b.platformStatus !== "active" ? 600 : 0) -
        b.salesLast30Days.revenueAmount;
      return bScore - aScore;
    })
    .slice(0, 8);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Operación
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Overview de plataforma
          </h1>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/solicitudes?status=pending"
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Revisar solicitudes
          </Link>
          <Link
            href="/admin/comisiones"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Finanzas
          </Link>
        </div>
      </header>

      <section className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white md:grid-cols-3 xl:grid-cols-6">
        <AdminMetric
          label="GMV 7 días"
          value={formatCurrency(overview.salesLast7Days.revenueAmount)}
          detail={`${overview.salesLast7Days.paidOrders} pagos`}
        />
        <AdminMetric
          label="GMV 30 días"
          value={formatCurrency(overview.salesLast30Days.revenueAmount)}
          detail={`${overview.salesLast30Days.paidOrders} pagos`}
        />
        <AdminMetric
          label="Ticket promedio"
          value={formatCurrency(overview.salesLast30Days.averageTicketAmount)}
          detail="Últimos 30 días"
        />
        <AdminMetric
          label="Locales activos"
          value={overview.businesses.active}
          detail={`${overview.businesses.connectedPayments} con pagos`}
        />
        <AdminMetric
          label="Comisión mes"
          value={formatCurrency(overview.commissionsCurrentMonth.estimatedAmount)}
          detail={`${overview.commissionsCurrentMonth.configuredBusinesses} configurados`}
        />
        <AdminMetric
          label="Soporte"
          value={overview.support.openIncidents}
          detail={`${overview.support.highSeverityOpenIncidents} alta prioridad`}
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.8fr)]">
        <AdminHeatmap
          title="Actividad por día y hora"
          description="Pedidos pagados o autorizados de los últimos 30 días."
          heatmap={overview.dayHourHeatmapLast30Days}
        />
        <AdminSalesBars
          title="GMV diario"
          description="Últimos 30 días, volumen procesado día a día."
          items={overview.salesSeriesLast30Days}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-950">
                Solicitudes pendientes
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Pipeline de crecimiento para revisar.
              </p>
            </div>
            <Link href="/admin/solicitudes?status=pending" className="text-sm font-medium text-slate-950">
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-slate-200">
            {pendingApplications.slice(0, 8).map((application) => (
              <Link
                key={application.id}
                href={`/admin/solicitudes/${application.id}`}
                className="grid gap-1 px-5 py-3 text-sm hover:bg-slate-50"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-slate-950">
                    {application.businessName}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(application.createdAt).toLocaleDateString("es-UY")}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {application.contactName} · {application.city ?? "Sin ciudad"} ·{" "}
                  {application.businessType ?? "Sin tipo"}
                </span>
              </Link>
            ))}
            {pendingApplications.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-500">
                No hay solicitudes pendientes.
              </p>
            ) : null}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-950">Watchlist</h2>
              <p className="mt-1 text-xs text-slate-500">
                Locales con pendientes operativos o comerciales.
              </p>
            </div>
            <Link href="/admin/negocios" className="text-sm font-medium text-slate-950">
              Ver negocios
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Local</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Comisión</th>
                  <th className="px-4 py-3 font-medium">GMV 30d</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {watchlist.map((business) => (
                  <tr key={business.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/negocios/${business.id}`}
                        className="font-medium text-slate-950"
                      >
                        {business.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-slate-500">@{business.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {business.platformStatus} · {business.paymentConnectionStatus}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatPercent(business.commissionBps)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-950">
                      {formatCurrency(business.salesLast30Days.revenueAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
