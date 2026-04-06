import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getFormattedPaymentStatus,
  getMercadoPagoReturnLabel,
  syncMercadoPagoPayment,
} from "@/lib/mercadopago/server";
import { getOrderConfirmation } from "@/lib/supabase/orders";

type ConfirmationPageProps = {
  params: Promise<{ slug: string; orderNumber: string }>;
  searchParams: Promise<{
    checkout_status?: string;
    payment_id?: string;
    collection_id?: string;
  }>;
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "En preparacion",
  ready_for_pickup: "Listo para retirar",
  completed: "Retirado",
  canceled: "Cancelado",
};

export default async function ConfirmationPage({
  params,
  searchParams,
}: ConfirmationPageProps) {
  const { slug, orderNumber } = await params;
  const { checkout_status, payment_id, collection_id } = await searchParams;
  const parsedOrderNumber = Number(orderNumber);

  if (Number.isNaN(parsedOrderNumber)) {
    notFound();
  }

  const returnedPaymentId = payment_id ?? collection_id;

  if (returnedPaymentId) {
    try {
      await syncMercadoPagoPayment(returnedPaymentId);
    } catch {}
  }

  const confirmation = await getOrderConfirmation(slug, parsedOrderNumber);

  if (!confirmation) {
    notFound();
  }

  const paymentLabel = getMercadoPagoReturnLabel(
    confirmation.order.paymentStatus,
    checkout_status
  );

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-6 py-10 md:px-10 lg:px-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
            {paymentLabel.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Pedido #{confirmation.order.orderNumber}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
            {paymentLabel.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-[var(--color-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--color-foreground)]">
              {statusLabels[confirmation.order.statusCode] ??
                confirmation.order.statusCode}
            </span>
            <span className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-[var(--color-muted)]">
              Pago {getFormattedPaymentStatus(confirmation.order.paymentStatus)}
            </span>
            <span className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-[var(--color-muted)]">
              Total {confirmation.order.formattedTotal}
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_360px]">
          <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-7 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Resumen del pedido
            </h2>
            <div className="mt-6 space-y-4">
              {confirmation.order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] pb-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-foreground)]">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {item.quantity} x {item.formattedUnitPrice}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[var(--color-foreground)]">
                    {item.formattedLineTotal}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between text-base font-semibold text-[var(--color-foreground)]">
              <span>Total</span>
              <span>{confirmation.order.formattedTotal}</span>
            </div>
          </section>

          <aside className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-7 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Pago y retiro
            </h2>
            <p className="mt-4 text-sm font-medium text-[var(--color-foreground)]">
              Estado del pago:{" "}
              <span className="text-[var(--color-accent)]">
                {getFormattedPaymentStatus(confirmation.order.paymentStatus)}
              </span>
            </p>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
              {confirmation.order.pickupAddress}
            </p>
            {confirmation.order.pickupInstructions ? (
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                {confirmation.order.pickupInstructions}
              </p>
            ) : null}
            <p className="mt-6 text-sm text-[var(--color-muted)]">
              A nombre de {confirmation.order.customerName}
            </p>
            <div className="mt-8">
              <Link
                href={`/locales/${confirmation.business.slug}`}
                className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95"
              >
                Volver al menu
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
