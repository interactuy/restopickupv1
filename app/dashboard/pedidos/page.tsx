import { formatPrice } from "@/lib/public-catalog";
import {
  getDashboardOrders,
  requireCompletedDashboardContext,
} from "@/lib/dashboard/server";

import { EmptyState } from "@/components/public/empty-state";
import { OrderStatusForm } from "@/components/dashboard/order-status-form";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "En preparacion",
  ready_for_pickup: "Listo para retirar",
  completed: "Entregado",
  canceled: "Cancelado",
};

export default async function DashboardOrdersPage() {
  const context = await requireCompletedDashboardContext();
  const orders = await getDashboardOrders(context.business.id);

  return (
    <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
        Pedidos
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
        Pedidos del local
      </h1>

      {orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            eyebrow="Sin pedidos"
            title="Todavía no hay pedidos para gestionar"
            description="Cuando entren compras reales, vas a poder actualizar el estado de cada pedido desde acá."
          />
        </div>
      ) : (
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

              <div className="mt-5">
                <OrderStatusForm orderId={order.id} statusCode={order.statusCode} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
