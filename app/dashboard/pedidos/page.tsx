import Link from "next/link";

import { AutoRefresh } from "@/components/live/auto-refresh";
import { getFormattedPaymentStatus } from "@/lib/mercadopago/server";
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

const statusBadgeStyles: Record<string, string> = {
  pending: "bg-[rgba(198,90,46,0.12)] text-[var(--color-accent)]",
  confirmed: "bg-[rgba(198,90,46,0.12)] text-[var(--color-accent)]",
  preparing: "bg-[rgba(201,138,43,0.16)] text-[#9A6514]",
  ready_for_pickup: "bg-[rgba(18,224,138,0.24)] text-[#008F53]",
  completed: "bg-[rgba(16,201,121,0.2)] text-[#00814A]",
  canceled: "bg-[rgba(181,66,50,0.12)] text-[#B54232]",
};

const statusCardStyles: Record<string, string> = {
  pending: "border-l-[6px] border-l-[var(--color-accent)]",
  confirmed: "border-l-[6px] border-l-[var(--color-accent)]",
  preparing: "border-l-[6px] border-l-[#C98A2B]",
  ready_for_pickup: "border-l-[6px] border-l-[#12E08A]",
  completed: "border-l-[6px] border-l-[#10C979]",
  canceled: "border-l-[6px] border-l-[#B54232]",
};

const statusPanelStyles: Record<string, string> = {
  pending: "bg-[linear-gradient(135deg,rgba(198,90,46,0.12),rgba(198,90,46,0.04))]",
  confirmed: "bg-[linear-gradient(135deg,rgba(198,90,46,0.12),rgba(198,90,46,0.04))]",
  preparing: "bg-[linear-gradient(135deg,rgba(201,138,43,0.14),rgba(201,138,43,0.05))]",
  ready_for_pickup: "bg-[linear-gradient(135deg,rgba(18,224,138,0.18),rgba(18,224,138,0.07))]",
  completed: "bg-[linear-gradient(135deg,rgba(16,201,121,0.1),rgba(16,201,121,0.03))]",
  canceled: "bg-[linear-gradient(135deg,rgba(181,66,50,0.08),rgba(181,66,50,0.02))]",
};

const statusFocusLabels: Record<string, string> = {
  pending: "Nuevo",
  confirmed: "Nuevo",
  preparing: "En cocina",
  ready_for_pickup: "Retirar ahora",
  completed: "Histórico",
  canceled: "Histórico",
};

const statusFocusStyles: Record<string, string> = {
  pending: "bg-[var(--color-accent)] text-white",
  confirmed: "bg-[var(--color-accent)] text-white",
  preparing: "bg-[#C98A2B] text-white",
  ready_for_pickup: "bg-[#10C979] text-white",
  completed: "bg-[rgba(16,201,121,0.14)] text-[#00814A]",
  canceled: "bg-[rgba(181,66,50,0.12)] text-[#B54232]",
};

function getReadyPriority(order: Awaited<ReturnType<typeof getDashboardOrders>>[number]) {
  if (!order.estimatedReadyAt) {
    return null;
  }

  const minutesUntilReady = Math.round(
    (new Date(order.estimatedReadyAt).getTime() - Date.now()) / 60000
  );

  if (minutesUntilReady <= 0) {
    return {
      label: "Atrasado",
      className: "bg-[rgba(181,66,50,0.12)] text-[#B54232]",
    };
  }

  if (minutesUntilReady <= 5) {
    return {
      label: "Ahora",
      className: "bg-[rgba(18,224,138,0.18)] text-[#008F53]",
    };
  }

  if (minutesUntilReady <= 12) {
    return {
      label: "Próximo",
      className: "bg-[rgba(201,138,43,0.16)] text-[#9A6514]",
    };
  }

  return null;
}

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
    description: "Historial de pedidos entregados de los ultimos 10 dias.",
  },
  canceled: {
    label: "Cancelados",
    description: "Pedidos cancelados de los ultimos 10 dias.",
  },
} as const;

type DashboardOrdersPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

function getTabFromSearchParam(tab?: string): keyof typeof tabConfig {
  if (tab === "preparing" || tab === "delivered" || tab === "canceled") {
    return tab;
  }

  return "pending";
}

function OrdersList({
  orders,
  businessSlug,
  showDeleteAction,
  showAdminDetails,
  activeTab,
}: {
  orders: Awaited<ReturnType<typeof getDashboardOrders>>;
  businessSlug: string;
  showDeleteAction: boolean;
  showAdminDetails: boolean;
  activeTab: keyof typeof tabConfig;
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

  const sortedOrders = [...orders].sort((left, right) => {
    if (activeTab === "preparing") {
      const leftReadyAt = left.estimatedReadyAt
        ? new Date(left.estimatedReadyAt).getTime()
        : Number.POSITIVE_INFINITY;
      const rightReadyAt = right.estimatedReadyAt
        ? new Date(right.estimatedReadyAt).getTime()
        : Number.POSITIVE_INFINITY;

      if (leftReadyAt !== rightReadyAt) {
        return leftReadyAt - rightReadyAt;
      }

      return new Date(left.placedAt).getTime() - new Date(right.placedAt).getTime();
    }

    if (activeTab === "pending") {
      return new Date(right.placedAt).getTime() - new Date(left.placedAt).getTime();
    }

    return new Date(right.placedAt).getTime() - new Date(left.placedAt).getTime();
  });

  return (
    <div className="mt-6 space-y-3">
      {sortedOrders.map((order) => {
        const readyPriority = activeTab === "preparing" ? getReadyPriority(order) : null;

        return (
        <details
          key={order.id}
          open={activeTab !== "delivered" && activeTab !== "canceled"}
          className={`group overflow-hidden rounded-[1.35rem] border border-[var(--color-border)] bg-white ${statusCardStyles[order.statusCode] ?? ""}`}
        >
          <summary
            className={`cursor-pointer list-none px-5 py-4 marker:hidden [&::-webkit-details-marker]:hidden ${statusPanelStyles[order.statusCode] ?? ""}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                    Pedido #{order.orderNumber}
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                      statusFocusStyles[order.statusCode] ??
                      "bg-[var(--color-accent)] text-white"
                    }`}
                  >
                    {statusFocusLabels[order.statusCode] ?? "Activo"}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusBadgeStyles[order.statusCode] ??
                      "bg-[rgba(198,90,46,0.12)] text-[var(--color-accent)]"
                    }`}
                  >
                    {statusLabels[order.statusCode] ?? order.statusCode}
                  </span>
                  {order.statusCode === "ready_for_pickup" ? (
                    <span className="rounded-full border border-[rgba(18,224,138,0.28)] bg-white px-3 py-1 text-xs font-medium text-[#008F53]">
                      Listo para entregar
                    </span>
                  ) : null}
                  {readyPriority ? (
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${readyPriority.className}`}
                    >
                      {readyPriority.label}
                    </span>
                  ) : null}
                  <span className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
                    {order.items.reduce((total, item) => total + item.quantity, 0)} item
                    {order.items.reduce((total, item) => total + item.quantity, 0) === 1
                      ? ""
                      : "s"}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold text-[var(--color-foreground)] md:text-xl">
                    {order.customerName}
                  </h2>
                  <span className="text-sm text-[var(--color-muted)]">
                    {new Date(order.placedAt).toLocaleTimeString("es-UY", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--color-muted)]">
                  {order.items
                    .map((item) => `${item.quantity}x ${item.productName}`)
                    .join(" · ")}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  {order.estimatedReadyAt ? (
                    <span className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-[var(--color-muted)]">
                      Retiro{" "}
                      {new Date(order.estimatedReadyAt).toLocaleTimeString("es-UY", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  ) : null}
                  {order.customerPhone ? (
                    <span className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-[var(--color-muted)]">
                      {order.customerPhone}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex w-full items-start justify-between gap-4 sm:w-auto sm:flex-col sm:items-end sm:text-right">
                <div>
                  <p className="text-xl font-semibold tracking-tight text-[var(--color-foreground)] md:text-2xl">
                    {formatPrice(order.totalAmount, order.currencyCode)}
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Pago {getFormattedPaymentStatus(order.paymentStatus)}
                  </p>
                </div>
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-lg text-[var(--color-muted)] transition group-open:rotate-180">
                  ↓
                </span>
              </div>
            </div>
          </summary>

          <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--color-foreground)]">
                Qué pidió el cliente
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-muted)]">
                {order.items.reduce((total, item) => total + item.quantity, 0)} item
                {order.items.reduce((total, item) => total + item.quantity, 0) === 1
                  ? ""
                  : "s"}
              </p>
            </div>

            <div className="mt-4 divide-y divide-[var(--color-border)] rounded-[1rem] border border-[var(--color-border)] bg-white">
              {order.items.map((item) => (
                <div
                  key={`${order.id}-${item.productName}`}
                  className="flex items-start justify-between gap-4 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[rgba(198,90,46,0.1)] px-2 text-sm font-semibold text-[var(--color-accent)]">
                        {item.quantity}
                      </span>
                      <p className="text-sm font-semibold text-[var(--color-foreground)]">
                        {item.productName}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">
                      {formatPrice(
                        item.unitPriceAmount + item.unitOptionsAmount,
                        order.currencyCode
                      )}{" "}
                      c/u
                    </p>
                    {item.selectedOptions.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.selectedOptions.map((option) => (
                          <p
                            key={`${order.id}-${item.productName}-${option.groupName}-${option.itemName}`}
                            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs text-[var(--color-muted)]"
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
                  <p className="shrink-0 text-sm font-semibold text-[var(--color-foreground)]">
                    {formatPrice(item.lineTotalAmount, order.currencyCode)}
                  </p>
                </div>
              ))}
            </div>

            {order.customerNotes ? (
              <div className="mt-4 rounded-[1rem] border border-[var(--color-border)] bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  Comentario del cliente
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                  {order.customerNotes}
                </p>
              </div>
            ) : null}

            {showAdminDetails ? (
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--color-muted)]">
                <span className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5">
                  Creado {new Date(order.placedAt).toLocaleString("es-UY")}
                </span>
                <span className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5">
                  Pago {getFormattedPaymentStatus(order.paymentStatus)}
                </span>
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-[var(--color-border)] pt-4">
              <div className="flex flex-wrap items-end gap-4">
                <OrderReadyTimeForm
                  orderId={order.id}
                  businessSlug={businessSlug}
                  orderNumber={order.orderNumber}
                  defaultMinutes={order.estimatedReadyInMinutes}
                  submitLabel={
                    activeTab === "pending"
                      ? "Definir retiro"
                      : activeTab === "preparing"
                        ? "Ajustar retiro"
                        : "Actualizar retiro"
                  }
                />
                <OrderStatusForm
                  orderId={order.id}
                  statusCode={order.statusCode}
                  businessSlug={businessSlug}
                  orderNumber={order.orderNumber}
                  submitLabel={
                    activeTab === "pending"
                      ? "Mover pedido"
                      : activeTab === "preparing"
                        ? "Cambiar estado"
                        : activeTab === "canceled"
                          ? "Estado"
                          : "Actualizar estado"
                  }
                />
              </div>

              {showDeleteAction ? (
                <Link
                  href={`/dashboard/pedidos/${order.id}/eliminar`}
                  className="inline-flex items-center justify-center rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50"
                >
                  Eliminar pedido
                </Link>
              ) : null}
            </div>
          </div>
        </details>
      )})}
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
    <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
      <AutoRefresh intervalMs={10000} />
      <div className="border-b border-[var(--color-border)] px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
          Pedidos
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
          Pedidos del local
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
          Seguí los pedidos nuevos, en preparación, entregados y cancelados.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 px-5 py-4">
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

      <p className="px-5 pb-4 text-sm leading-7 text-[var(--color-muted)]">
        {tabConfig[activeTab].description}
      </p>

      <div className="px-5 pb-5">
        <OrdersList
          orders={activeOrders}
          businessSlug={context.business.slug}
          showDeleteAction={activeTab === "delivered" || activeTab === "canceled"}
          showAdminDetails={context.membership.isAdminRole && context.isAdminModeEnabled}
          activeTab={activeTab}
        />
      </div>
    </section>
  );
}
