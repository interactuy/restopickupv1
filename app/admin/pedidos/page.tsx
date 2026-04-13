import Link from "next/link";

import { getFormattedPaymentStatus } from "@/lib/mercadopago/server";
import {
  getAdminBusinesses,
  getAdminGlobalOrders,
  requireInternalAdminContext,
} from "@/lib/admin/server";
import { AdminMetric } from "@/components/admin/admin-charts";
import {
  AdminPageHeader,
  AdminPanel,
  AdminStatusPill,
  adminTableClasses,
} from "@/components/admin/admin-ui";

type AdminOrdersPageProps = {
  searchParams: Promise<{
    businessId?: string;
    status?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  await requireInternalAdminContext();
  const query = await searchParams;
  const [businesses, orders] = await Promise.all([
    getAdminBusinesses(),
    getAdminGlobalOrders({
      businessId: query.businessId,
      status: query.status,
      paymentStatus: query.paymentStatus,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    }),
  ]);

  const problematicOrders = orders.filter((order) => order.isProblematic).length;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Pedidos"
        title="Visor global"
        description="Pedidos de todos los locales, con filtros y detección inicial de casos problemáticos."
      />

      <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-5">
        <select
          name="businessId"
          defaultValue={query.businessId ?? ""}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">Todos los locales</option>
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={query.status ?? ""}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="confirmed">Confirmado</option>
          <option value="preparing">En preparación</option>
          <option value="ready_for_pickup">Listo</option>
          <option value="completed">Entregado</option>
          <option value="canceled">Cancelado</option>
        </select>
        <select
          name="paymentStatus"
          defaultValue={query.paymentStatus ?? ""}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">Todos los pagos</option>
          <option value="pending">Pendiente</option>
          <option value="authorized">Autorizado</option>
          <option value="paid">Pagado</option>
          <option value="failed">Fallido</option>
          <option value="canceled">Cancelado</option>
          <option value="refunded">Reembolsado</option>
        </select>
        <input
          type="date"
          name="dateFrom"
          defaultValue={query.dateFrom ?? ""}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
        <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          Filtrar
        </button>
      </form>

      <section className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white md:grid-cols-3">
        <AdminMetric label="Pedidos listados" value={orders.length} />
        <AdminMetric label="Problemáticos" value={problematicOrders} />
        <AdminMetric
          label="Volumen listado"
          value={formatCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
        />
      </section>

      <AdminPanel title="Pedidos" description="Máximo 200 resultados por consulta.">
        <div className="overflow-x-auto">
          <table className={adminTableClasses.table}>
            <thead className={adminTableClasses.thead}>
              <tr>
                <th className={adminTableClasses.th}>Pedido</th>
                <th className={adminTableClasses.th}>Local</th>
                <th className={adminTableClasses.th}>Cliente</th>
                <th className={adminTableClasses.th}>Estado</th>
                <th className={adminTableClasses.th}>Pago</th>
                <th className={adminTableClasses.th}>Total</th>
                <th className={adminTableClasses.th}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className={adminTableClasses.row}>
                  <td className={adminTableClasses.td}>
                    <span className="font-medium text-slate-950">
                      #{order.orderNumber ?? "—"}
                    </span>
                    {order.isProblematic ? (
                      <span className="ml-2 rounded-full bg-rose-50 px-2 py-1 text-xs text-rose-700">
                        Revisar
                      </span>
                    ) : null}
                  </td>
                  <td className={adminTableClasses.td}>
                    <Link
                      href={`/admin/negocios/${order.businessId}`}
                      className="font-medium text-slate-950 hover:text-emerald-700"
                    >
                      {order.businessName}
                    </Link>
                  </td>
                  <td className={`${adminTableClasses.td} text-slate-500`}>
                    {order.customerName}
                  </td>
                  <td className={adminTableClasses.td}>
                    <AdminStatusPill tone={order.statusCode === "canceled" ? "danger" : "neutral"}>
                      {order.statusCode}
                    </AdminStatusPill>
                  </td>
                  <td className={adminTableClasses.td}>
                    <AdminStatusPill
                      tone={
                        order.paymentStatus === "paid" || order.paymentStatus === "authorized"
                          ? "success"
                          : order.paymentStatus === "failed" || order.paymentStatus === "canceled"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {getFormattedPaymentStatus(order.paymentStatus)}
                    </AdminStatusPill>
                  </td>
                  <td className={`${adminTableClasses.td} font-medium text-slate-950`}>
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className={`${adminTableClasses.td} text-slate-500`}>
                    {new Date(order.placedAt).toLocaleString("es-UY")}
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
