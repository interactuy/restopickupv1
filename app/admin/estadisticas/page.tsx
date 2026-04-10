import Link from "next/link";
import type { ReactNode } from "react";

import {
  getAdminBusinesses,
  getAdminPlatformHealthStats,
  requireInternalAdminContext,
} from "@/lib/admin/server";
import {
  AdminHeatmap,
  AdminMetric,
  AdminRevenueLineChart,
  AdminSalesBars,
} from "@/components/admin/admin-charts";
import { AdminPageHeader, AdminPanel, adminTableClasses } from "@/components/admin/admin-ui";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatRate(rate: number | null) {
  return rate === null ? "Sin datos" : `${rate}%`;
}

function formatNumber(value: number | null, suffix = "") {
  return value === null ? "Sin datos" : `${value}${suffix}`;
}

function formatGrowth(rate: number | null) {
  if (rate === null) {
    return "Sin histórico";
  }

  return `${rate > 0 ? "+" : ""}${rate}% vs mes anterior`;
}

function MetricSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <AdminPanel title={title} description={description}>
      <div className="grid overflow-hidden md:grid-cols-2 xl:grid-cols-4">{children}</div>
    </AdminPanel>
  );
}

export default async function AdminStatsPage() {
  await requireInternalAdminContext();
  const [stats, businesses] = await Promise.all([
    getAdminPlatformHealthStats(),
    getAdminBusinesses(),
  ]);

  const topBusinesses = [...businesses]
    .sort((a, b) => b.salesLast30Days.revenueAmount - a.salesLast30Days.revenueAmount)
    .slice(0, 8);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Estadísticas"
        title="Salud general de la app"
        description="Una vista operativa para entender negocio, demanda, marketplace, conversión, operación, retención y onboarding."
      />

      <section className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white md:grid-cols-2 xl:grid-cols-6">
        <AdminMetric
          label="GMV total"
          value={formatCurrency(stats.business.gmvTotalAmount)}
          detail={`${stats.demand.paidOrders} pedidos pagos`}
        />
        <AdminMetric
          label="Comisión neta"
          value={formatCurrency(stats.business.netCommissionAmount)}
          detail={`${formatRate(stats.business.realTakeRate)} take rate`}
        />
        <AdminMetric
          label="Ticket promedio"
          value={formatCurrency(stats.demand.averageTicketAmount)}
          detail="Pedidos pagos"
        />
        <AdminMetric
          label="Locales activos"
          value={`${stats.marketplace.activeBusinesses}/${stats.marketplace.registeredBusinesses}`}
          detail="Activos vs registrados"
        />
        <AdminMetric
          label="Clientes activos"
          value={stats.marketplace.activeCustomersLast30Days}
          detail="Últimos 30 días"
        />
        <AdminMetric
          label="Concentración top 2"
          value={formatRate(stats.marketplace.topTwoBusinessesRevenueShare)}
          detail="Dependencia de ventas"
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.8fr)]">
        <AdminHeatmap
          title="Actividad por día y hora"
          description="Pedidos pagos o autorizados de los últimos 30 días."
          heatmap={stats.dayHourHeatmapLast30Days}
        />
        <AdminSalesBars
          title="GMV diario"
          description="Últimos 30 días de volumen procesado."
          items={stats.salesSeriesLast30Days}
        />
      </div>

      <div className="grid gap-4 2xl:grid-cols-2">
        <AdminRevenueLineChart
          title="Crecimiento mensual"
          description="GMV por mes de los últimos 12 meses."
          items={stats.monthlySalesSeriesLast12Months}
        />

        <MetricSection
          title="Negocio"
          description="Volumen, comisión y crecimiento mensual de la plataforma."
        >
          <AdminMetric
            label="GMV mes"
            value={formatCurrency(stats.business.currentMonthGmvAmount)}
            detail={formatGrowth(stats.business.monthlyGmvGrowthRate)}
          />
          <AdminMetric
            label="Comisión mes"
            value={formatCurrency(stats.business.currentMonthCommissionAmount)}
            detail={formatGrowth(stats.business.monthlyCommissionGrowthRate)}
          />
          <AdminMetric
            label="GMV mes previo"
            value={formatCurrency(stats.business.previousMonthGmvAmount)}
            detail="Base comparativa"
          />
          <AdminMetric
            label="Comisión previa"
            value={formatCurrency(stats.business.previousMonthCommissionAmount)}
            detail="Base comparativa"
          />
        </MetricSection>

        <MetricSection
          title="Demanda"
          description="Uso real del marketplace y comportamiento de compra."
        >
          <AdminMetric label="Pedidos totales" value={stats.demand.totalOrders} />
          <AdminMetric
            label="Pedidos/local"
            value={stats.demand.ordersPerActiveBusiness}
            detail="Sobre locales activos"
          />
          <AdminMetric
            label="Frecuencia cliente"
            value={formatNumber(stats.demand.purchaseFrequencyPerCustomer, "x")}
            detail="Pedidos por cliente identificado"
          />
          <AdminMetric
            label="Ticket promedio"
            value={formatCurrency(stats.demand.averageTicketAmount)}
          />
        </MetricSection>

        <MetricSection
          title="Salud marketplace"
          description="Balance de oferta, clientes activos y dependencia comercial."
        >
          <AdminMetric
            label="Activos"
            value={`${stats.marketplace.activeBusinesses}/${stats.marketplace.registeredBusinesses}`}
            detail="Locales activos vs registrados"
          />
          <AdminMetric
            label="Clientes 30d"
            value={stats.marketplace.activeCustomersLast30Days}
            detail="Con teléfono identificado"
          />
          <AdminMetric
            label="Ratio pedidos/local"
            value={stats.marketplace.ordersPerBusinessLast30Days}
            detail="Últimos 30 días"
          />
          <AdminMetric
            label="Top 1 ventas"
            value={formatRate(stats.marketplace.topBusinessRevenueShare)}
            detail="Concentración de GMV"
          />
        </MetricSection>

        <MetricSection
          title="Conversión"
          description={
            stats.conversion.hasTracking
              ? "Funnel medido con eventos de navegación."
              : "La base está lista, falta instrumentar eventos de menú, carrito y checkout."
          }
        >
          <AdminMetric
            label="Menú → carrito"
            value={formatRate(stats.conversion.menuToCartRate)}
            detail={`${stats.conversion.menuViews} visitas · ${stats.conversion.cartAdds} carritos`}
          />
          <AdminMetric
            label="Carrito → checkout"
            value={formatRate(stats.conversion.cartToCheckoutRate)}
            detail={`${stats.conversion.checkoutStarts} checkouts`}
          />
          <AdminMetric
            label="Checkout → pedido"
            value={formatRate(stats.conversion.checkoutToOrderRate)}
            detail={`${stats.conversion.ordersCreated} pedidos creados`}
          />
          <AdminMetric
            label="Pedido → pago"
            value={formatRate(stats.conversion.orderToPaymentRate)}
            detail={`${stats.conversion.paymentSuccesses} pagos exitosos`}
          />
          <AdminMetric
            label="Conversión total"
            value={formatRate(stats.conversion.totalPurchaseRate)}
            detail="Menú a compra"
          />
        </MetricSection>

        <MetricSection
          title="Operación"
          description="Calidad del proceso desde pago hasta retiro y soporte."
        >
          <AdminMetric
            label="Tiempo a listo"
            value={formatNumber(stats.operation.averageReadyMinutes, " min")}
            detail="Promedio hasta listo"
          />
          <AdminMetric label="Cancelados" value={stats.operation.canceledOrders} />
          <AdminMetric label="Error de pago" value={stats.operation.paymentErrorOrders} />
          <AdminMetric
            label="No retirados"
            value={stats.operation.notPickedUpOrders}
            detail="Listos hace más de 2 h"
          />
        </MetricSection>

        <MetricSection
          title="Retención"
          description="Recompra de clientes y señales tempranas de churn de locales."
        >
          <AdminMetric
            label="Repeat rate"
            value={formatRate(stats.retention.repeatCustomerRate)}
            detail="Clientes con 2+ pedidos"
          />
          <AdminMetric
            label="Recompra 30d"
            value={formatRate(stats.retention.customersBuyingAgainWithin30DaysRate)}
            detail="Vuelven dentro de 30 días"
          />
          <AdminMetric
            label="Locales sin ventas"
            value={stats.retention.businessesWithoutSalesLast30Days}
            detail="Últimos 30 días"
          />
          <AdminMetric
            label="Churn locales"
            value={formatRate(stats.retention.localChurnRate)}
            detail="Inactivos o bloqueados"
          />
        </MetricSection>

        <MetricSection
          title="Onboarding"
          description="Embudo desde solicitud hasta primer pedido real."
        >
          <AdminMetric
            label="Aprobación"
            value={formatRate(stats.onboarding.applicationApprovalRate)}
            detail={`${stats.onboarding.applicationsApproved}/${stats.onboarding.applicationsTotal} solicitudes`}
          />
          <AdminMetric
            label="Aprobado → completo"
            value={formatRate(stats.onboarding.approvedToOnboardingCompletedRate)}
            detail="Onboarding del local"
          />
          <AdminMetric
            label="Completo → 1er pedido"
            value={formatRate(stats.onboarding.onboardingCompletedToFirstOrderRate)}
            detail="Activación comercial"
          />
          <AdminMetric
            label="Días a 1er pedido"
            value={formatNumber(stats.onboarding.averageDaysFromApplicationToFirstOrder, " días")}
            detail="Desde solicitud"
          />
        </MetricSection>
      </div>

      <AdminPanel
        title="Locales top por ventas"
        description="Ranking por GMV de los últimos 30 días para detectar concentración y oportunidades."
      >
        <div className="overflow-x-auto">
          <table className={adminTableClasses.table}>
            <thead className={adminTableClasses.thead}>
              <tr>
                <th className={adminTableClasses.th}>#</th>
                <th className={adminTableClasses.th}>Local</th>
                <th className={adminTableClasses.th}>Pedidos 30d</th>
                <th className={adminTableClasses.th}>GMV 30d</th>
                <th className={adminTableClasses.th}>Comisión</th>
              </tr>
            </thead>
            <tbody>
              {topBusinesses.map((business, index) => (
                <tr key={business.id} className={adminTableClasses.row}>
                  <td className={`${adminTableClasses.td} font-semibold text-emerald-700`}>
                    #{index + 1}
                  </td>
                  <td className={adminTableClasses.td}>
                    <Link
                      href={`/admin/negocios/${business.id}`}
                      className="font-medium text-slate-950 hover:text-emerald-700"
                    >
                      {business.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500">@{business.slug}</p>
                  </td>
                  <td className={`${adminTableClasses.td} text-slate-500`}>
                    {business.salesLast30Days.paidOrders}
                  </td>
                  <td className={`${adminTableClasses.td} font-medium text-slate-950`}>
                    {formatCurrency(business.salesLast30Days.revenueAmount)}
                  </td>
                  <td className={`${adminTableClasses.td} text-slate-500`}>
                    {business.commissionBps / 100}%
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
