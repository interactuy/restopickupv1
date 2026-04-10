import Link from "next/link";

import { getAdminBusinesses, requireInternalAdminContext } from "@/lib/admin/server";
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

export default async function AdminBusinessesPage() {
  await requireInternalAdminContext();
  const businesses = await getAdminBusinesses();

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Negocios"
        title="Locales y estado comercial"
        description="Ficha operativa por negocio: plataforma, onboarding, pagos, volumen y comisión."
      />

      <AdminPanel
        title="Negocios"
        description={`${businesses.length} local${businesses.length === 1 ? "" : "es"} cargado${businesses.length === 1 ? "" : "s"}.`}
      >
        <div className="overflow-x-auto">
          <table className={adminTableClasses.table}>
            <thead className={adminTableClasses.thead}>
              <tr>
                <th className={adminTableClasses.th}>Local</th>
                <th className={adminTableClasses.th}>Equipo</th>
                <th className={adminTableClasses.th}>Plataforma</th>
                <th className={adminTableClasses.th}>Onboarding</th>
                <th className={adminTableClasses.th}>Pagos</th>
                <th className={adminTableClasses.th}>GMV 30d</th>
                <th className={adminTableClasses.th}>Comisión</th>
                <th className={adminTableClasses.th}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((business) => (
                <tr key={business.id} className={adminTableClasses.row}>
                  <td className={adminTableClasses.td}>
                    <div className="font-medium text-slate-950">{business.name}</div>
                    <div className="mt-0.5 text-xs text-slate-500">@{business.slug}</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {business.contactEmail ?? "Sin email"}
                    </div>
                  </td>
                  <td className={`${adminTableClasses.td} text-slate-500`}>
                    <div>
                      {business.memberCounts.owners} owner · {business.memberCounts.admins} admin
                    </div>
                    <div className="mt-0.5">{business.memberCounts.staff} staff</div>
                  </td>
                  <td className={adminTableClasses.td}>
                    <AdminStatusPill
                      tone={
                        business.platformStatus === "active"
                          ? "success"
                          : business.platformStatus === "blocked"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {business.platformStatus === "active"
                        ? "Activo"
                        : business.platformStatus === "blocked"
                          ? "Bloqueado"
                          : "Pausado"}
                    </AdminStatusPill>
                  </td>
                  <td className={adminTableClasses.td}>
                    <AdminStatusPill tone={business.onboardingCompletedAt ? "success" : "warning"}>
                      {business.onboardingCompletedAt ? "Completo" : "Pendiente"}
                    </AdminStatusPill>
                  </td>
                  <td className={adminTableClasses.td}>
                    <AdminStatusPill
                      tone={
                        business.paymentConnectionStatus === "connected"
                          ? "success"
                          : business.paymentConnectionStatus === "error"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {business.paymentConnectionStatus === "connected"
                        ? "Conectado"
                        : business.paymentConnectionStatus === "error"
                          ? "Con error"
                          : "Pendiente"}
                    </AdminStatusPill>
                  </td>
                  <td className={`${adminTableClasses.td} text-slate-500`}>
                    <div>{business.salesLast30Days.paidOrders} pagos</div>
                    <div className="mt-0.5 font-medium text-slate-950">
                      {formatCurrency(business.salesLast30Days.revenueAmount)}
                    </div>
                  </td>
                  <td className={`${adminTableClasses.td} text-slate-500`}>
                    <div className="font-medium text-slate-950">
                      {formatPercent(business.commissionBps)}
                    </div>
                    <div className="mt-0.5">
                      {formatCurrency(business.estimatedCommissionCurrentMonthAmount)}
                    </div>
                  </td>
                  <td className={adminTableClasses.td}>
                    <Link
                      href={`/admin/negocios/${business.id}`}
                      className="font-medium text-emerald-700 hover:text-emerald-800"
                    >
                      Ver detalle
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
