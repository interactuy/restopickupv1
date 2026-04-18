"use client";

import Link from "next/link";

import { useCart } from "@/components/cart/cart-provider";
import { formatPrice } from "@/lib/public-catalog";

type CartSummaryPanelProps = {
  businessId: string;
  businessSlug: string;
  businessName?: string;
  currencyCode: string;
  variant?: "sidebar" | "page";
};

export function CartSummaryPanel({
  businessId,
  businessSlug,
  businessName,
  currencyCode,
  variant = "sidebar",
}: CartSummaryPanelProps) {
  const { getCart, updateQuantity, removeItem, getItemCount, getSubtotal, isReady } =
    useCart();
  const cart = getCart(businessId);
  const itemCount = getItemCount(businessId);
  const subtotal = getSubtotal(businessId);
  const isPage = variant === "page";

  return (
    <aside
      className={`overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-white/96 ${
        isPage ? "" : "lg:sticky lg:top-6"
      }`}
    >
      <div className="border-b border-[var(--color-border)] px-6 py-5 md:px-7 md:py-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
            Tu carrito
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            {isPage ? `Pedido en ${businessName ?? "el local"}` : "Pedido para retirar"}
          </h2>
          {isPage ? (
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              Revisá el pedido antes de confirmar.
            </p>
          ) : null}
        </div>
        <span className="rounded-full bg-[var(--color-surface-strong)] px-3 py-2 text-sm font-semibold text-[var(--color-foreground)]">
          {itemCount}
        </span>
      </div>
      </div>

      {!isReady || !cart || cart.items.length === 0 ? (
        <div className="px-6 py-6 md:px-7">
        <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <p className="text-sm leading-7 text-[var(--color-muted)]">
            Agregá productos del menú para ver el resumen del pedido antes de pasar
            al checkout.
          </p>
          <div className="mt-5">
            <Link
              href={`/locales/${businessSlug}`}
              className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Volver al menú
            </Link>
          </div>
        </div>
        </div>
      ) : (
        <>
          <div className="divide-y divide-[var(--color-border)]">
            {cart.items.map((item) => (
              <div
                key={item.lineId}
                className="px-6 py-5 md:px-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
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
                            {option.priceDeltaAmount > 0
                              ? ` (+ ${formatPrice(
                                  option.priceDeltaAmount,
                                  item.currencyCode
                                )})`
                              : ""}
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
                  <button
                    type="button"
                    onClick={() => removeItem(businessId, item.lineId)}
                    className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
                  >
                    Quitar
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-white">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(businessId, item.lineId, item.quantity - 1)
                      }
                      className="px-3 py-2 text-sm font-semibold text-[var(--color-foreground)]"
                    >
                      -
                    </button>
                    <span className="min-w-10 text-center text-sm font-semibold text-[var(--color-foreground)]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(businessId, item.lineId, item.quantity + 1)
                      }
                      className="px-3 py-2 text-sm font-semibold text-[var(--color-foreground)]"
                    >
                      +
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-[var(--color-foreground)]">
                    {formatPrice(
                      (item.priceAmount + item.unitOptionsAmount) * item.quantity,
                      item.currencyCode
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5 md:px-7">
            <div className="flex items-center justify-between text-base font-medium text-[var(--color-foreground)]">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal, currencyCode)}</span>
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              Podés seguir sumando productos o pasar al pago.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {isPage ? (
                <Link
                  href={`/locales/${businessSlug}`}
                  className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  Seguir eligiendo
                </Link>
              ) : null}
              <Link
                href={`/locales/${businessSlug}/checkout`}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95"
              >
                Continuar al checkout
              </Link>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
