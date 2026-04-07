"use client";

import Link from "next/link";

import { useCart } from "@/components/cart/cart-provider";
import { formatPrice } from "@/lib/public-catalog";

type FloatingCartButtonProps = {
  businessId: string;
  businessSlug: string;
  currencyCode: string;
};

export function FloatingCartButton({
  businessId,
  businessSlug,
  currencyCode,
}: FloatingCartButtonProps) {
  const { getItemCount, getSubtotal, isReady } = useCart();
  const itemCount = getItemCount(businessId);
  const subtotal = getSubtotal(businessId);

  if (!isReady || itemCount === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <Link
        href={`/locales/${businessSlug}/carrito`}
        className="pointer-events-auto inline-flex w-full max-w-md items-center justify-between gap-4 rounded-full border border-[var(--color-border)] bg-[var(--color-foreground)] px-5 py-3 text-sm font-semibold text-white shadow-[0_24px_70px_rgba(39,24,13,0.3)] transition hover:translate-y-[-1px] hover:brightness-110"
      >
        <span className="inline-flex items-center gap-3">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-[0.18em]">
            {itemCount} producto{itemCount === 1 ? "" : "s"}
          </span>
          <span>Ver pedido</span>
        </span>
        <span>{formatPrice(subtotal, currencyCode)}</span>
      </Link>
    </div>
  );
}
