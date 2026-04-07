import Link from "next/link";
import { notFound } from "next/navigation";

import { AutoRefresh } from "@/components/live/auto-refresh";
import {
  getFormattedPaymentStatus,
  getMercadoPagoReturnLabel,
  syncMercadoPagoPayment,
  syncMercadoPagoPaymentByExternalReference,
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

function buildGoogleMapsUrl(address: string) {
  const encodedAddress = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
}

function buildAppleMapsUrl(address: string) {
  const encodedAddress = encodeURIComponent(address);
  return `https://maps.apple.com/?q=${encodedAddress}`;
}

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

  const initialConfirmation = await getOrderConfirmation(slug, parsedOrderNumber);

  if (!initialConfirmation) {
    notFound();
  }

  const returnedPaymentId = payment_id ?? collection_id;
  let syncErrorMessage: string | null = null;

  try {
    if (returnedPaymentId) {
      await syncMercadoPagoPayment(returnedPaymentId);
    } else if (checkout_status) {
      await syncMercadoPagoPaymentByExternalReference(initialConfirmation.order.id);
    }
  } catch (error) {
    syncErrorMessage =
      error instanceof Error
        ? error.message
        : "No pudimos sincronizar el estado del pago.";

    console.error("[mercadopago:return] payment sync failed", {
      slug,
      orderNumber: parsedOrderNumber,
      checkoutStatus: checkout_status,
      returnedPaymentId,
      error: syncErrorMessage,
    });
  }

  const confirmation =
    (await getOrderConfirmation(slug, parsedOrderNumber)) ?? initialConfirmation;

  const paymentLabel = getMercadoPagoReturnLabel(
    confirmation.order.paymentStatus,
    checkout_status
  );
  const shouldAutoRefresh =
    !["completed", "canceled"].includes(confirmation.order.statusCode) ||
    !["paid", "authorized"].includes(confirmation.order.paymentStatus);
  const googleMapsUrl = buildGoogleMapsUrl(confirmation.order.pickupAddress);
  const appleMapsUrl = buildAppleMapsUrl(confirmation.order.pickupAddress);

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-6 py-10 md:px-10 lg:px-12">
      <AutoRefresh enabled={shouldAutoRefresh} intervalMs={12000} />
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
          {syncErrorMessage ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Todavía no pudimos confirmar el pago automáticamente. Reintentá en unos
              segundos o revisá el webhook de Mercado Pago.
            </div>
          ) : null}

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
            {confirmation.order.estimatedReadyAt ? (
              <span className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-[var(--color-muted)]">
                Retiro aprox.{" "}
                {new Date(confirmation.order.estimatedReadyAt).toLocaleTimeString(
                  "es-UY",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_360px]">
          <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-7 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Resumen del pedido
            </h2>
            <div className="mt-4 grid gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  Cliente
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--color-foreground)]">
                  {confirmation.order.customerName}
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {confirmation.order.customerPhone ?? "Sin celular cargado"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  Pedido realizado
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--color-foreground)]">
                  {new Date(confirmation.order.placedAt).toLocaleString("es-UY")}
                </p>
                {confirmation.order.estimatedReadyAt ? (
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    Estimado de retiro:{" "}
                    {new Date(
                      confirmation.order.estimatedReadyAt
                    ).toLocaleTimeString("es-UY", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                ) : null}
              </div>
            </div>
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
                    {item.selectedOptions.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {item.selectedOptions.map((option) => (
                          <p
                            key={`${item.id}-${option.groupName}-${option.itemName}`}
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
                    {item.formattedLineTotal}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between text-base font-semibold text-[var(--color-foreground)]">
              <span>Total</span>
              <span>{confirmation.order.formattedTotal}</span>
            </div>

            {confirmation.order.customerNotes ? (
              <div className="mt-6 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  Comentario para el local
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                  {confirmation.order.customerNotes}
                </p>
              </div>
            ) : null}
          </section>

          <aside className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-7 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Pago y retiro
            </h2>
            <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)]">
              <div className="bg-[radial-gradient(circle_at_top_left,_rgba(198,122,48,0.2),_transparent_55%),linear-gradient(135deg,#f5e7d4_0%,#efe4d3_50%,#e6d6be_100%)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                  Punto de retiro
                </p>
                <p className="mt-3 text-lg font-semibold text-[var(--color-foreground)]">
                  {confirmation.order.businessName}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-foreground)]">
                  {confirmation.order.pickupAddress}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 p-4">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
                >
                  Cómo llegar
                </a>
                <a
                  href={appleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  Abrir en mapas
                </a>
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-[var(--color-foreground)]">
              Retirás en{" "}
              <span className="text-[var(--color-accent)]">
                {confirmation.order.businessName}
              </span>
            </p>
            <p className="mt-4 text-sm font-medium text-[var(--color-foreground)]">
              Estado del pago:{" "}
              <span className="text-[var(--color-accent)]">
                {getFormattedPaymentStatus(confirmation.order.paymentStatus)}
              </span>
            </p>
            <p className="mt-4 text-sm font-medium text-[var(--color-foreground)]">
              Estado del pedido:{" "}
              <span className="text-[var(--color-accent)]">
                {statusLabels[confirmation.order.statusCode] ??
                  confirmation.order.statusCode}
              </span>
            </p>
            {confirmation.order.estimatedReadyAt ? (
              <p className="mt-4 text-sm font-medium text-[var(--color-foreground)]">
                Tiempo aproximado:{" "}
                <span className="text-[var(--color-accent)]">
                  hasta las{" "}
                  {new Date(
                    confirmation.order.estimatedReadyAt
                  ).toLocaleTimeString("es-UY", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </p>
            ) : null}
            {confirmation.order.pickupInstructions ? (
              <div className="mt-4 rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  Instrucciones de retiro
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                  {confirmation.order.pickupInstructions}
                </p>
              </div>
            ) : null}
            {confirmation.order.contactPhone ? (
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                Contacto del local: {confirmation.order.contactPhone}
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
