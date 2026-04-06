"use client";

import Link from "next/link";

import { useCart } from "@/components/cart/cart-provider";
import { formatPrice } from "@/lib/public-catalog";

type CartSummaryPanelProps = {
  businessId: string;
  businessSlug: string;
  currencyCode: string;
};

export function CartSummaryPanel({
  businessId,
  businessSlug,
  currencyCode,
}: CartSummaryPanelProps) {
  const { getCart, updateQuantity, removeItem, getItemCount, getSubtotal, isReady } =
    useCart();
  const cart = getCart(businessId);
  const itemCount = getItemCount(businessId);
  const subtotal = getSubtotal(businessId);

  return (
    <aside className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm lg:sticky lg:top-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
            Tu carrito
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Pedido para retirar
          </h2>
        </div>
        <span className="rounded-full bg-[var(--color-surface-strong)] px-3 py-2 text-sm font-semibold text-[var(--color-foreground)]">
          {itemCount}
        </span>
      </div>

      {!isReady || !cart || cart.items.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <p className="text-sm leading-7 text-[var(--color-muted)]">
            Agregá productos del menú para ver el resumen del pedido acá antes de
            pasar al checkout.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {formatPrice(item.priceAmount, item.currencyCode)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(businessId, item.productId)}
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
                        updateQuantity(businessId, item.productId, item.quantity - 1)
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
                        updateQuantity(businessId, item.productId, item.quantity + 1)
                      }
                      className="px-3 py-2 text-sm font-semibold text-[var(--color-foreground)]"
                    >
                      +
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-[var(--color-foreground)]">
                    {formatPrice(item.priceAmount * item.quantity, item.currencyCode)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <div className="flex items-center justify-between text-sm text-[var(--color-muted)]">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal, currencyCode)}</span>
            </div>
            <p className="mt-3 text-xs leading-6 text-[var(--color-muted)]">
              El pago se define más adelante. En este paso vamos a registrar el
              pedido para retiro en el local.
            </p>
            <div className="mt-5">
              <Link
                href={`/locales/${businessSlug}/checkout`}
                className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95"
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
