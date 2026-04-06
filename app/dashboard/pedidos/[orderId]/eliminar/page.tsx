import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteOrderAction } from "@/lib/dashboard/actions";
import {
  getDashboardOrderById,
  requireCompletedDashboardContext,
} from "@/lib/dashboard/server";
import { formatPrice } from "@/lib/public-catalog";
import { SubmitButton } from "@/components/dashboard/submit-button";

type DeleteOrderPageProps = {
  params: Promise<{ orderId: string }>;
};

const statusLabels: Record<string, string> = {
  completed: "Entregado",
  canceled: "Cancelado",
};

export default async function DeleteOrderPage({
  params,
}: DeleteOrderPageProps) {
  const context = await requireCompletedDashboardContext();
  const { orderId } = await params;
  const order = await getDashboardOrderById(context.business.id, orderId);

  if (!order || !["completed", "canceled"].includes(order.statusCode)) {
    notFound();
  }

  return (
    <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-600">
        Eliminar pedido
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
        ¿Seguro querés eliminar este pedido?
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
        Esta acción borra el pedido del panel del local y también sus ítems
        asociados. Usala solo si realmente ya no necesitás conservar ese registro.
      </p>

      <div className="mt-8 rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
          Pedido #{order.orderNumber}
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--color-foreground)]">
          {order.customerName}
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Estado {statusLabels[order.statusCode] ?? order.statusCode} ·{" "}
          {new Date(order.placedAt).toLocaleString("es-UY")}
        </p>
        <p className="mt-2 text-sm font-semibold text-[var(--color-foreground)]">
          Total {formatPrice(order.totalAmount, order.currencyCode)}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <form action={deleteOrderAction}>
          <input type="hidden" name="orderId" value={order.id} />
          <SubmitButton
            label="Sí, eliminar pedido"
            pendingLabel="Eliminando..."
            className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </form>
        <Link
          href="/dashboard/pedidos?tab=delivered"
          className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          Cancelar
        </Link>
      </div>
    </section>
  );
}
