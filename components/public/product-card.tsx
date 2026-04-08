"use client";

import { useMemo, useState } from "react";

import {
  buildCartLineId,
  type CartProductSnapshot,
  type CartSelectedOptionItem,
} from "@/lib/cart";
import { formatPrice, type PublicProduct } from "@/lib/public-catalog";

type ProductCardProps = {
  product: PublicProduct;
  onAddToCart?: (
    product: CartProductSnapshot,
    lineId: string,
    selectedOptions: CartSelectedOptionItem[],
    unitOptionsAmount: number,
    customerNote: string | null
  ) => void;
};

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isConfiguratorOpen, setIsConfiguratorOpen] = useState(false);
  const [selectedByGroup, setSelectedByGroup] = useState<Record<string, string[]>>(
    () =>
      Object.fromEntries(
        product.optionGroups.map((group) => [
          group.id,
          group.isRequired && group.selectionType === "single"
            ? [group.items[0]?.id].filter(Boolean)
            : [],
        ])
      )
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [customerNote, setCustomerNote] = useState("");

  const selectedOptions = useMemo(() => {
    return product.optionGroups.flatMap<CartSelectedOptionItem>((group) => {
      const selectedIds = selectedByGroup[group.id] ?? [];
      return group.items
        .filter((item) => selectedIds.includes(item.id))
        .map((item) => ({
          groupId: group.id,
          groupName: group.name,
          itemId: item.id,
          itemName: item.name,
          priceDeltaAmount: item.priceDeltaAmount,
        }));
    });
  }, [product.optionGroups, selectedByGroup]);

  const unitOptionsAmount = selectedOptions.reduce(
    (total, item) => total + item.priceDeltaAmount,
    0
  );
  const hasOffer =
    product.compareAtAmount !== null && product.compareAtAmount > product.priceAmount;
  const offerPercentage = hasOffer
    ? Math.round(
        ((product.compareAtAmount! - product.priceAmount) / product.compareAtAmount!) * 100
      )
    : null;

  function handlePlainAdd() {
    onAddToCart?.(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceAmount: product.priceAmount,
        currencyCode: product.currencyCode,
        imageUrl: product.image?.publicUrl ?? null,
        imageAlt: product.image?.altText ?? null,
      },
      buildCartLineId(product.id, []),
      [],
      0,
      null
    );
  }

  function handleConfiguredAdd() {
    for (const group of product.optionGroups) {
      const selectedIds = selectedByGroup[group.id] ?? [];

      if (group.isRequired && selectedIds.length < Math.max(1, group.minSelect)) {
        setValidationError(`Elegí una opción para "${group.name}".`);
        return;
      }

      if (group.maxSelect !== null && selectedIds.length > group.maxSelect) {
        setValidationError(`"${group.name}" admite hasta ${group.maxSelect} opciones.`);
        return;
      }
    }

    setValidationError(null);
    onAddToCart?.(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceAmount: product.priceAmount,
        currencyCode: product.currencyCode,
        imageUrl: product.image?.publicUrl ?? null,
        imageAlt: product.image?.altText ?? null,
      },
      buildCartLineId(
        product.id,
        selectedOptions.map((item) => item.itemId),
        customerNote
      ),
      selectedOptions,
      unitOptionsAmount,
      customerNote.trim() || null
    );
    setIsConfiguratorOpen(false);
    setCustomerNote("");
  }

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-white shadow-[0_20px_60px_rgba(39,24,13,0.08)] transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,#f5e7d4_0%,#efe4d3_50%,#e6d6be_100%)]">
        {hasOffer ? (
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
            <span className="rounded-full bg-[var(--color-accent)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_10px_24px_rgba(198,122,48,0.3)]">
              Oferta
            </span>
            {offerPercentage ? (
              <span className="rounded-full bg-white/92 px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)] shadow-[0_10px_24px_rgba(39,24,13,0.12)]">
                -{offerPercentage}%
              </span>
            ) : null}
          </div>
        ) : null}

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
          <div className="shrink-0 text-right">
            {hasOffer ? (
              <p className="mb-1 text-xs font-medium text-[var(--color-muted)] line-through">
                {formatPrice(product.compareAtAmount!, product.currencyCode)}
              </p>
            ) : null}
            <div className="rounded-full bg-[var(--color-surface-strong)] px-3 py-2 text-sm font-semibold text-[var(--color-foreground)]">
              {formatPrice(product.priceAmount, product.currencyCode)}
            </div>
          </div>
        </div>

        {onAddToCart ? (
          <button
            type="button"
            onClick={() =>
              product.optionGroups.length > 0
                ? setIsConfiguratorOpen(true)
                : handlePlainAdd()
            }
            className="inline-flex w-full items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            {product.optionGroups.length > 0 ? "Elegir opciones" : "Agregar al carrito"}
          </button>
        ) : null}

        {isConfiguratorOpen ? (
          <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--color-foreground)]">
                Personalizá tu pedido
              </p>
              <button
                type="button"
                onClick={() => {
                  setValidationError(null);
                  setIsConfiguratorOpen(false);
                }}
                className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {product.optionGroups.map((group) => {
                const selectedIds = selectedByGroup[group.id] ?? [];

                return (
                  <div key={group.id} className="rounded-[1.25rem] border border-[var(--color-border)] bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-foreground)]">
                          {group.name}
                        </p>
                        {group.description ? (
                          <p className="mt-1 text-sm text-[var(--color-muted)]">
                            {group.description}
                          </p>
                        ) : null}
                      </div>
                      {group.isRequired ? (
                        <span className="rounded-full bg-[var(--color-surface-strong)] px-2.5 py-1 text-xs font-semibold text-[var(--color-foreground)]">
                          Obligatorio
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3 space-y-2">
                      {group.items.map((item) => {
                        const checked = selectedIds.includes(item.id);
                        return (
                          <label
                            key={item.id}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] px-3 py-3 text-sm"
                          >
                            <span className="flex items-center gap-3">
                              <input
                                type={group.selectionType === "single" ? "radio" : "checkbox"}
                                name={`group-${group.id}`}
                                checked={checked}
                                onChange={() => {
                                  setSelectedByGroup((current) => {
                                    const currentSelected = current[group.id] ?? [];
                                    const nextSelected =
                                      group.selectionType === "single"
                                        ? [item.id]
                                        : checked
                                          ? currentSelected.filter((id) => id !== item.id)
                                          : [...currentSelected, item.id];

                                    return {
                                      ...current,
                                      [group.id]: nextSelected,
                                    };
                                  });
                                }}
                              />
                              <span>{item.name}</span>
                            </span>
                            <span className="font-medium text-[var(--color-foreground)]">
                              {item.priceDeltaAmount > 0
                                ? `+ ${formatPrice(
                                    item.priceDeltaAmount,
                                    product.currencyCode
                                  )}`
                                : "Sin cargo"}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {validationError ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {validationError}
              </div>
            ) : null}

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm text-[var(--color-muted)]">
                Precio final por unidad
              </p>
              <p className="text-base font-semibold text-[var(--color-foreground)]">
                {formatPrice(
                  product.priceAmount + unitOptionsAmount,
                  product.currencyCode
                )}
              </p>
            </div>

            <div className="mt-4">
              <label
                htmlFor={`product-note-${product.id}`}
                className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
              >
                Nota para este producto
              </label>
              <textarea
                id={`product-note-${product.id}`}
                rows={3}
                maxLength={200}
                value={customerNote}
                onChange={(event) => setCustomerNote(event.target.value)}
                placeholder="Ej. sin cebolla, salsa aparte, cortar al medio"
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none"
              />
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                Opcional. Hasta 200 caracteres.
              </p>
            </div>

            <button
              type="button"
              onClick={handleConfiguredAdd}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95"
            >
              Agregar con opciones
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
