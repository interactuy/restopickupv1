import Link from "next/link";

import { getAdminBusinesses, getAdminOverview, requireInternalAdminContext } from "@/lib/admin/server";
import {
  AdminMetric,
} from "@/components/admin/admin-charts";
import {
  AdminPageHeader,
  AdminPanel,
  AdminStatusPill,
  adminTableClasses,
} from "@/components/admin/admin-ui";

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

export default async function AdminCommissionsPage() {
  await requireInternalAdminContext("/admin/comisiones");
  const [overview, businesses] = await Promise.all([
    getAdminOverview(),
    getAdminBusinesses(),
  ]);

  const businessesByCommission = [...businesses].sort(
    (a, b) => b.estimatedCommissionCurrentMonthAmount - a.estimatedCommissionCurrentMonthAmount
  );

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Finanzas"
        title="Comisiones y volumen"
        description="Seguimiento mensual de comisiones por local, volumen procesado y configuración comercial."
      />

      <section className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white md:grid-cols-3">
        <AdminMetric
          label="Comisión estimada mes"
          value={formatCurrency(overview.commissionsCurrentMonth.estimatedAmount)}
          detail="Sobre pagos cobrados/autorizados"
        />
        <AdminMetric
          label="Negocios configurados"
          value={overview.commissionsCurrentMonth.configuredBusinesses}
          detail="Con comisión mayor a 0%"
        />
        <AdminMetric
          label="GMV histórico"
          value={formatCurrency(overview.salesAllTime.revenueAmount)}
          detail={`${overview.salesAllTime.paidOrders} pagos acumulados`}
        />
      </section>

      <AdminPanel
        title="Negocio por negocio"
        description="Importes estimados del mes actual. Para cambiar porcentaje o notas, entrá a la ficha del negocio."
      >
        <div className="overflow-x-auto">
          <table className={adminTableClasses.table}>
            <thead className={adminTableClasses.thead}>
              <tr>
                <th className={adminTableClasses.th}>Negocio</th>
                <th className={adminTableClasses.th}>Comisión</th>
                <th className={adminTableClasses.th}>GMV 30d</th>
                <th className={adminTableClasses.th}>Estimado mes</th>
                <th className={adminTableClasses.th}>Pagos</th>
                <th className={adminTableClasses.th}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {businessesByCommission.map((business) => (
                <tr key={business.id} className={adminTableClasses.row}>
                  <td className={adminTableClasses.td}>
                    <div className="font-medium text-slate-950">{business.name}</div>
                    <div className="mt-0.5 text-xs text-slate-500">@{business.slug}</div>
                  </td>
                  <td className={adminTableClasses.td}>
                    <div className="font-medium text-slate-950">
                      {formatPercent(business.commissionBps)}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {business.billingNotes ? "Con nota interna" : "Sin nota"}
                    </div>
                  </td>
                  <td className={adminTableClasses.td}>
                    <div className="font-medium text-slate-950">
                      {formatCurrency(business.salesLast30Days.revenueAmount)}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {business.salesLast30Days.paidOrders} pagos
                    </div>
                  </td>
                  <td className={`${adminTableClasses.td} font-medium text-slate-950`}>
                    {formatCurrency(business.estimatedCommissionCurrentMonthAmount)}
                  </td>
                  <td className={adminTableClasses.td}>
                    <AdminStatusPill
                      tone={business.paymentConnectionStatus === "connected" ? "success" : "warning"}
                    >
                      {business.paymentConnectionStatus === "connected"
                        ? "Conectado"
                        : "Pendiente"}
                    </AdminStatusPill>
                  </td>
                  <td className={adminTableClasses.td}>
                    <Link
                      href={`/admin/negocios/${business.id}`}
                      className="font-medium text-emerald-700 hover:text-emerald-800"
                    >
                      Configurar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}
