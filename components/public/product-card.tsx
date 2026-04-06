"use client";

import type { CartProductSnapshot } from "@/lib/cart";
import { formatPrice, type PublicProduct } from "@/lib/public-catalog";

type ProductCardProps = {
  product: PublicProduct;
  onAddToCart?: (product: CartProductSnapshot) => void;
};

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-white shadow-[0_20px_60px_rgba(39,24,13,0.08)] transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,#f5e7d4_0%,#efe4d3_50%,#e6d6be_100%)]">
        {product.image?.publicUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image.publicUrl}
            alt={product.image.altText ?? product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-end bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.8),_transparent_55%),linear-gradient(135deg,#f0deca_0%,#dec1a3_100%)] p-5">
            <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-[var(--color-foreground)]">
              Sin imagen cargada
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
              {product.name}
            </h3>
            {product.description ? (
              <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                {product.description}
              </p>
            ) : null}
          </div>
          <div className="shrink-0 rounded-full bg-[var(--color-surface-strong)] px-3 py-2 text-sm font-semibold text-[var(--color-foreground)]">
            {formatPrice(product.priceAmount, product.currencyCode)}
          </div>
        </div>

        {onAddToCart ? (
          <button
            type="button"
            onClick={() =>
              onAddToCart({
                productId: product.id,
                name: product.name,
                slug: product.slug,
                description: product.description,
                priceAmount: product.priceAmount,
                currencyCode: product.currencyCode,
                imageUrl: product.image?.publicUrl ?? null,
                imageAlt: product.image?.altText ?? null,
              })
            }
            className="inline-flex w-full items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Agregar al carrito
          </button>
        ) : null}
      </div>
    </article>
  );
}
