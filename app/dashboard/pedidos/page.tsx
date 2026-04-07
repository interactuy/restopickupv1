import Link from "next/link";

import { AutoRefresh } from "@/components/live/auto-refresh";
import { formatPrice } from "@/lib/public-catalog";
import {
  getDashboardOrders,
  partitionDashboardOrders,
  requireCompletedDashboardContext,
} from "@/lib/dashboard/server";

import { EmptyState } from "@/components/public/empty-state";
import { OrderReadyTimeForm } from "@/components/dashboard/order-ready-time-form";
import { OrderStatusForm } from "@/components/dashboard/order-status-form";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "En preparacion",
  ready_for_pickup: "Listo para retirar",
  completed: "Entregado",
  canceled: "Cancelado",
};

const tabConfig = {
  pending: {
    label: "Por hacer",
    description: "Pedidos nuevos que todavia no empezaste a preparar.",
  },
  preparing: {
    label: "En preparacion",
    description: "Pedidos que estan en cocina o listos para retirar.",
  },
  delivered: {
    label: "Entregados",
    description:
      "Historial de pedidos entregados o cancelados de los ultimos 10 dias.",
  },
} as const;

type DashboardOrdersPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

function getTabFromSearchParam(tab?: string): keyof typeof tabConfig {
  if (tab === "preparing" || tab === "delivered") {
    return tab;
  }

  return "pending";
}

function OrdersList({
  orders,
  businessSlug,
  showDeleteAction,
}: {
  orders: Awaited<ReturnType<typeof getDashboardOrders>>;
  businessSlug: string;
  showDeleteAction: boolean;
}) {
  if (orders.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState
          eyebrow="Sin pedidos"
          title="No hay pedidos en esta pestaña"
          description="Cuando un pedido entre en este estado, lo vas a ver listado acá."
        />
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-5">
      {orders.map((order) => (
        <article
          key={order.id}
          className="rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Pedido #{order.orderNumber}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--color-foreground)]">
                {order.customerName}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {order.customerPhone ?? "Sin celular"} ·{" "}
                {new Date(order.placedAt).toLocaleString("es-UY")}
              </p>
              {order.estimatedReadyAt ? (
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Estimado de retiro:{" "}
                  {new Date(order.estimatedReadyAt).toLocaleTimeString("es-UY", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              ) : null}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-[var(--color-muted)]">
                Estado
              </p>
              <p className="mt-1 text-base font-semibold text-[var(--color-foreground)]">
                {statusLabels[order.statusCode] ?? order.statusCode}
              </p>
              <p className="mt-3 text-sm text-[var(--color-muted)]">
                Pago {order.paymentStatus}
              </p>
              <p className="mt-1 text-base font-semibold text-[var(--color-foreground)]">
                {formatPrice(order.totalAmount, order.currencyCode)}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-[var(--color-border)] bg-white/70 p-4">
            <p className="text-sm font-semibold text-[var(--color-foreground)]">
              Qué pidió el cliente
            </p>
            <div className="mt-4 space-y-3">
              {order.items.map((item) => (
                <div
                  key={`${order.id}-${item.productName}`}
                  className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] pb-3 last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--color-foreground)]">
                      {item.productName}
                    </p>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">
                          {item.quantity} x{" "}
                          {formatPrice(
                            item.unitPriceAmount + item.unitOptionsAmount,
                            order.currencyCode
                          )}
                        </p>
                        {item.selectedOptions.length > 0 ? (
                          <div className="mt-2 space-y-1">
                            {item.selectedOptions.map((option) => (
                              <p
                                key={`${order.id}-${item.productName}-${option.groupName}-${option.itemName}`}
                                className="text-xs text-[var(--color-muted)]"
                              >
                                {option.groupName}: {option.itemName}
                              </p>
                            ))}
                          </div>
                        ) : null}
                        {item.notes ? (
                          <p className="mt-2 text-xs text-[var(--color-muted)]">
                            Nota: {item.notes}
                          </p>
                        ) : null}
                      </div>
                  <p className="text-sm font-semibold text-[var(--color-foreground)]">
                    {formatPrice(item.lineTotalAmount, order.currencyCode)}
                  </p>
                </div>
              ))}
            </div>

            {order.customerNotes ? (
              <div className="mt-4 rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  Comentario del cliente
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                  {order.customerNotes}
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-end gap-4">
              <OrderReadyTimeForm
                orderId={order.id}
                businessSlug={businessSlug}
                orderNumber={order.orderNumber}
                defaultMinutes={order.estimatedReadyInMinutes}
              />
              <OrderStatusForm
                orderId={order.id}
                statusCode={order.statusCode}
                businessSlug={businessSlug}
                orderNumber={order.orderNumber}
              />
            </div>

            {showDeleteAction ? (
              <Link
                href={`/dashboard/pedidos/${order.id}/eliminar`}
                className="inline-flex items-center justify-center rounded-full border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50"
              >
                Eliminar pedido
              </Link>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

export default async function DashboardOrdersPage({
  searchParams,
}: DashboardOrdersPageProps) {
  const context = await requireCompletedDashboardContext();
  const orders = await getDashboardOrders(context.business.id);
  const groupedOrders = partitionDashboardOrders(orders);
  const activeTab = getTabFromSearchParam((await searchParams).tab);
  const activeOrders = groupedOrders[activeTab];

  return (
    <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
      <AutoRefresh intervalMs={10000} />
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
        Pedidos
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
        Pedidos del local
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
        Organizá la operación por etapa y mantené visible el historial reciente
        de los últimos 10 días.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {(Object.keys(tabConfig) as Array<keyof typeof tabConfig>).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Link
              key={tab}
              href={`/dashboard/pedidos?tab=${tab}`}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-[var(--color-accent)] text-white"
                  : "border border-[var(--color-border)] bg-white text-[var(--color-foreground)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              }`}
            >
              <span>{tabConfig[tab].label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  isActive ? "bg-white/15 text-white" : "bg-[var(--color-surface)]"
                }`}
              >
                {groupedOrders[tab].length}
              </span>
            </Link>
          );
        })}
      </div>

      <p className="mt-5 text-sm leading-7 text-[var(--color-muted)]">
        {tabConfig[activeTab].description}
      </p>

      <OrdersList
        orders={activeOrders}
        businessSlug={context.business.slug}
        showDeleteAction={activeTab === "delivered"}
      />
    </section>
  );
}
