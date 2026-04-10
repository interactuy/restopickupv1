"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCart } from "@/components/cart/cart-provider";
import { MercadoPagoTestModeNote } from "@/components/cart/mercadopago-test-mode-note";
import { getFunnelSessionId, trackFunnelEvent } from "@/lib/analytics/funnel-client";
import { formatPrice, type PublicBusiness } from "@/lib/public-catalog";

const checkoutFormSchema = z.object({
  customerName: z.string().trim().min(1, "Ingresa tu nombre."),
  customerPhone: z.string().trim().optional(),
  customerNotes: z.string().trim().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

type CheckoutFormProps = {
  business: PublicBusiness;
  isMercadoPagoTestMode: boolean;
};

export function CheckoutForm({
  business,
  isMercadoPagoTestMode,
}: CheckoutFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { getCart, clearCart, isReady } = useCart();
  const hasTrackedCheckout = useRef(false);
  const cart = getCart(business.id);
  const subtotal =
    cart?.items.reduce(
      (total, item) =>
        total + (item.priceAmount + item.unitOptionsAmount) * item.quantity,
      0
    ) ?? 0;

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerNotes: "",
    },
  });

  useEffect(() => {
    if (hasTrackedCheckout.current || !cart || cart.items.length === 0) {
      return;
    }

    hasTrackedCheckout.current = true;
    trackFunnelEvent({
      eventType: "checkout_started",
      businessId: business.id,
      metadata: {
        businessSlug: business.slug,
        itemsCount: cart.items.length,
        subtotal,
      },
    });
  }, [business.id, business.slug, cart, subtotal]);

  async function onSubmit(values: CheckoutFormValues) {
    if (!cart || cart.items.length === 0) {
      setErrorMessage("Tu carrito esta vacio.");
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessSlug: business.slug,
          funnelSessionId: getFunnelSessionId(),
          customerName: values.customerName,
          customerPhone: values.customerPhone,
          customerNotes: values.customerNotes,
          items: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            selectedOptionItemIds: item.selectedOptions.map((option) => option.itemId),
            itemNotes: item.customerNote ?? "",
          })),
        }),
      });

      const payload = (await response.json()) as
        | { error: string; requestId?: string; errorCode?: string }
        | {
            checkoutUrl: string;
            orderNumber: number;
            requestId?: string;
          };

      if (!response.ok || "error" in payload) {
        setErrorMessage(
          "error" in payload
            ? payload.error
            : "No pudimos preparar el pago. Probá de nuevo en unos segundos."
        );
        return;
      }

      clearCart(business.id);
      window.location.href = payload.checkoutUrl;
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_380px] lg:items-start">
      <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-7 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
          Checkout invitado
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
          Confirmá tu pedido
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
          No necesitas crear una cuenta. Solo dejanos tu nombre y, si querés,
          un celular o comentario para el pedido.
        </p>

        <div className="mt-6">
          <MercadoPagoTestModeNote enabled={isMercadoPagoTestMode} />
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-8 space-y-5"
        >
          <div>
            <label
              htmlFor="customerName"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Nombre
            </label>
            <input
              id="customerName"
              {...form.register("customerName")}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
              placeholder="Ej. Martina"
            />
            {form.formState.errors.customerName ? (
              <p className="mt-2 text-sm text-red-700">
                {form.formState.errors.customerName.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="customerPhone"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Celular
            </label>
            <input
              id="customerPhone"
              {...form.register("customerPhone")}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
              placeholder="Opcional"
            />
          </div>

          <div>
            <label
              htmlFor="customerNotes"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Comentario para el pedido
            </label>
            <textarea
              id="customerNotes"
              {...form.register("customerNotes")}
              rows={4}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
              placeholder="Opcional. Ej. retirar despues de las 21:00"
            />
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!isReady || !cart || cart.items.length === 0 || isPending}
            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white transition enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Preparando pago..." : "Pagar con Mercado Pago"}
          </button>
        </form>
      </section>

      <aside className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm lg:sticky lg:top-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
          Resumen
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
          {business.name}
        </h2>
        <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
          Retiro en {business.pickupAddress}
        </p>
        {business.pickupInstructions ? (
          <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
            {business.pickupInstructions}
          </p>
        ) : null}

        {!isReady || !cart || cart.items.length === 0 ? (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <p className="text-sm leading-7 text-[var(--color-muted)]">
              Tu carrito esta vacio. Volve al menu del local para sumar
              productos antes de confirmar.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.lineId}
                  className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] pb-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-foreground)]">
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {item.quantity} x{" "}
                      {formatPrice(
                        item.priceAmount + item.unitOptionsAmount,
                        item.currencyCode
                      )}
                    </p>
                    {item.selectedOptions.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {item.selectedOptions.map((option) => (
                          <p
                            key={`${item.lineId}-${option.itemId}`}
                            className="text-xs text-[var(--color-muted)]"
                          >
                            {option.groupName}: {option.itemName}
                          </p>
                        ))}
                      </div>
                    ) : null}
                    {item.customerNote ? (
                      <p className="mt-2 text-xs text-[var(--color-muted)]">
                        Nota: {item.customerNote}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-sm font-semibold text-[var(--color-foreground)]">
                    {formatPrice(
                      (item.priceAmount + item.unitOptionsAmount) * item.quantity,
                      item.currencyCode
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between text-base font-semibold text-[var(--color-foreground)]">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal, business.currencyCode)}</span>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
