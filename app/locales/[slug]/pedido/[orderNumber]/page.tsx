import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AutoRefresh } from "@/components/live/auto-refresh";
import { RecentOrderMemory } from "@/components/public/recent-order-memory";
import {
  getFormattedPaymentStatus,
  getMercadoPagoReturnLabel,
  markMercadoPagoRedirectAsAuthorized,
  syncMercadoPagoPayment,
  syncMercadoPagoPaymentByExternalReference,
} from "@/lib/mercadopago/server";
import { getBusinessContactAction } from "@/lib/public-catalog";
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
  pending: "Recibido",
  confirmed: "Confirmado",
  preparing: "En preparacion",
  ready_for_pickup: "Listo para retirar",
  completed: "Retirado",
  canceled: "Cancelado",
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildGoogleMapsUrl(address: string) {
  const encodedAddress = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
}

function buildMapboxStaticMapUrl(params: {
  token: string;
  latitude: number;
  longitude: number;
}) {
  const { token, latitude, longitude } = params;
  const marker = `pin-s+cc7a30(${longitude},${latitude})`;
  const viewport = `${longitude},${latitude},15,0`;

  return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${marker}/${viewport}/960x540?access_token=${token}`;
}

function formatDateTime(value: string, timeZone: string) {
  const resolvedTimeZone =
    !timeZone || timeZone === "UTC" ? "America/Montevideo" : timeZone;

  return new Intl.DateTimeFormat("es-UY", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: resolvedTimeZone,
  }).format(new Date(value));
}

function formatTime(value: string, timeZone: string) {
  const resolvedTimeZone =
    !timeZone || timeZone === "UTC" ? "America/Montevideo" : timeZone;

  return new Intl.DateTimeFormat("es-UY", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: resolvedTimeZone,
  }).format(new Date(value));
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
  const baseConfirmation = initialConfirmation;

  const returnedPaymentId = payment_id ?? collection_id;
  async function syncAndReload() {
    try {
      if (returnedPaymentId) {
        await syncMercadoPagoPayment(returnedPaymentId);
      } else if (checkout_status) {
        await syncMercadoPagoPaymentByExternalReference(baseConfirmation.order.id);
      }
    } catch (error) {
      console.error("[mercadopago:return] payment sync failed", {
        slug,
        orderNumber: parsedOrderNumber,
        checkoutStatus: checkout_status,
        returnedPaymentId,
        error:
          error instanceof Error
            ? error.message
            : "No pudimos sincronizar el estado del pago.",
      });
    }

    const nextConfirmation = await getOrderConfirmation(slug, parsedOrderNumber);

    return nextConfirmation ?? baseConfirmation;
  }

  let confirmation = await syncAndReload();

  if (!confirmation) {
    notFound();
  }
  const resolvedConfirmation = confirmation;

  if (
    checkout_status === "success" &&
    !["paid", "authorized"].includes(resolvedConfirmation.order.paymentStatus)
  ) {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      await sleep(1500);
      confirmation = await syncAndReload();

      if (confirmation && ["paid", "authorized"].includes(confirmation.order.paymentStatus)) {
        break;
      }
    }
  }

  if (
    checkout_status === "success" &&
    confirmation &&
    !["paid", "authorized"].includes(confirmation.order.paymentStatus)
  ) {
    await markMercadoPagoRedirectAsAuthorized({
      orderId: confirmation.order.id,
    });
    confirmation =
      (await getOrderConfirmation(slug, parsedOrderNumber)) ?? confirmation;
  }
  const finalConfirmation = confirmation ?? resolvedConfirmation;

  const paymentLabel = getMercadoPagoReturnLabel(
    finalConfirmation.order.paymentStatus,
    checkout_status
  );
  const isPaymentConfirmed = ["paid", "authorized"].includes(
    finalConfirmation.order.paymentStatus
  );
  const isMercadoPagoReturn =
    Boolean(checkout_status) || Boolean(returnedPaymentId);
  const isPaymentFailure =
    finalConfirmation.order.paymentStatus === "failed" ||
    finalConfirmation.order.paymentStatus === "canceled" ||
    checkout_status === "failure";

  if (!isPaymentConfirmed && isPaymentFailure) {
    redirect(
      `/locales/${finalConfirmation.business.slug}/checkout?payment=${
        "failed"
      }`
    );
  }

  if (!isPaymentConfirmed && !isMercadoPagoReturn) {
    redirect(`/locales/${finalConfirmation.business.slug}/checkout?payment=pending`);
  }

  const shouldAutoRefresh =
    !isPaymentConfirmed ||
    !["completed", "canceled"].includes(finalConfirmation.order.statusCode);
  const googleMapsUrl = buildGoogleMapsUrl(finalConfirmation.order.pickupAddress);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mapboxPreviewUrl =
    mapboxToken &&
    finalConfirmation.business.latitude != null &&
    finalConfirmation.business.longitude != null
      ? buildMapboxStaticMapUrl({
          token: mapboxToken,
          latitude: finalConfirmation.business.latitude,
          longitude: finalConfirmation.business.longitude,
        })
      : null;
  const contactAction = getBusinessContactAction(finalConfirmation.business);
  const businessTimezone = finalConfirmation.business.timezone;
  const itemSummary = finalConfirmation.order.items
    .map((item) => `${item.quantity}x ${item.productName}`)
    .join(" · ");

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-6 py-10 md:px-10 lg:px-12">
      <RecentOrderMemory
        businessId={finalConfirmation.business.id}
        businessSlug={finalConfirmation.business.slug}
        businessName={finalConfirmation.business.name}
        orderNumber={finalConfirmation.order.orderNumber}
        paymentStatus={finalConfirmation.order.paymentStatus}
        statusCode={finalConfirmation.order.statusCode}
        placedAt={finalConfirmation.order.placedAt}
        estimatedReadyAt={finalConfirmation.order.estimatedReadyAt}
        itemSummary={itemSummary}
        totalAmount={finalConfirmation.order.totalAmount}
        currencyCode={finalConfirmation.order.currencyCode}
      />
      <AutoRefresh enabled={shouldAutoRefresh} intervalMs={12000} />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
            {paymentLabel.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Pedido #{finalConfirmation.order.orderNumber}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
            {paymentLabel.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-[var(--color-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--color-foreground)]">
              {statusLabels[finalConfirmation.order.statusCode] ??
                finalConfirmation.order.statusCode}
            </span>
            <span className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-[var(--color-muted)]">
              Pago {getFormattedPaymentStatus(finalConfirmation.order.paymentStatus)}
            </span>
            <span className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-[var(--color-muted)]">
              Total {finalConfirmation.order.formattedTotal}
            </span>
            {finalConfirmation.order.estimatedReadyAt ? (
              <span className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-[var(--color-muted)]">
                Retiro aprox.{" "}
                {formatTime(finalConfirmation.order.estimatedReadyAt, businessTimezone)}
              </span>
            ) : null}
          </div>
          {!isPaymentConfirmed && isMercadoPagoReturn ? (
            <div className="mt-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-900">
              Estamos confirmando tu pago. Esta pantalla se actualiza sola en unos segundos.
            </div>
          ) : null}
          {finalConfirmation.order.statusCode === "ready_for_pickup" ? (
            <div className="mt-6 rounded-[1.5rem] border border-[rgba(18,224,138,0.28)] bg-[rgba(18,224,138,0.14)] px-5 py-4 text-sm font-medium text-[#008F53]">
              Tu pedido ya está listo para retirar.
            </div>
          ) : null}
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
                  {finalConfirmation.order.customerName}
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {finalConfirmation.order.customerPhone ?? "Sin celular cargado"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  Pedido realizado
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--color-foreground)]">
                  {formatDateTime(finalConfirmation.order.placedAt, businessTimezone)}
                </p>
                {finalConfirmation.order.estimatedReadyAt ? (
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    Estimado de retiro:{" "}
                    {formatTime(
                      finalConfirmation.order.estimatedReadyAt,
                      businessTimezone
                    )}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {finalConfirmation.order.items.map((item) => (
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
              <span>{finalConfirmation.order.formattedTotal}</span>
            </div>

            {finalConfirmation.order.customerNotes ? (
              <div className="mt-6 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  Comentario para el local
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                  {finalConfirmation.order.customerNotes}
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
                  {finalConfirmation.order.businessName}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-foreground)]">
                  {finalConfirmation.order.pickupAddress}
                </p>
              </div>
              {mapboxPreviewUrl ? (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block border-t border-[var(--color-border)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mapboxPreviewUrl}
                    alt={`Mapa de ${finalConfirmation.order.businessName}`}
                    className="h-52 w-full object-cover"
                  />
                </a>
              ) : null}
            </div>
            <p className="mt-4 text-sm font-medium text-[var(--color-foreground)]">
              Estado del pago:{" "}
              <span className="text-[var(--color-accent)]">
                {getFormattedPaymentStatus(finalConfirmation.order.paymentStatus)}
              </span>
            </p>
            <p className="mt-4 text-sm font-medium text-[var(--color-foreground)]">
              Estado del pedido:{" "}
              <span className="text-[var(--color-accent)]">
                {statusLabels[finalConfirmation.order.statusCode] ??
                  finalConfirmation.order.statusCode}
              </span>
            </p>
            {finalConfirmation.order.estimatedReadyAt ? (
              <p className="mt-4 text-sm font-medium text-[var(--color-foreground)]">
                Tiempo aproximado:{" "}
                <span className="text-[var(--color-accent)]">
                  hasta las {formatTime(finalConfirmation.order.estimatedReadyAt, businessTimezone)}
                </span>
              </p>
            ) : null}
            {finalConfirmation.order.pickupInstructions ? (
              <div className="mt-4 rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  Instrucciones de retiro
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                  {finalConfirmation.order.pickupInstructions}
                </p>
              </div>
            ) : null}
            {contactAction ? (
              <div className="mt-4">
                <a
                  href={contactAction.href}
                  target={
                    finalConfirmation.business.contactActionType === "whatsapp"
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    finalConfirmation.business.contactActionType === "whatsapp"
                      ? "noreferrer"
                      : undefined
                  }
                  className="inline-flex w-full items-center justify-center rounded-full border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  {contactAction.label} al local
                </a>
              </div>
            ) : null}
            <p className="mt-6 text-sm text-[var(--color-muted)]">
              A nombre de {finalConfirmation.order.customerName}
            </p>
            <div className="mt-8">
              <Link
                href={`/locales/${finalConfirmation.business.slug}`}
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
