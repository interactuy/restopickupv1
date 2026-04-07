"use client";

import Link from "next/link";

import { CartSummaryPanel } from "@/components/cart/cart-summary-panel";
import { useCart } from "@/components/cart/cart-provider";
import type {
  PublicBusinessCatalog,
  PublicCategory,
} from "@/lib/public-catalog";

import { EmptyState } from "@/components/public/empty-state";
import { ProductCard } from "@/components/public/product-card";

type BusinessCatalogProps = {
  catalog: PublicBusinessCatalog;
};

function CategoryShortcut({
  category,
  productCount,
}: {
  category: PublicCategory;
  productCount: number;
}) {
  return (
    <a
      href={`#${category.slug}`}
      className="rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
    >
      {category.name}
      <span className="ml-2 text-[var(--color-muted)]">{productCount}</span>
    </a>
  );
}

export function BusinessCatalog({ catalog }: BusinessCatalogProps) {
  const { business, categories, products } = catalog;
  const { addItem, getItemCount } = useCart();
  const cartCount = getItemCount(business.id);

  const categoriesWithProducts = categories
    .map((category) => ({
      ...category,
      products: products.filter((product) => product.categoryId === category.id),
    }))
    .filter((category) => category.products.length > 0);

  const uncategorizedProducts = products.filter((product) => !product.categoryId);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <section className="relative overflow-hidden border-b border-[var(--color-border)]">
        <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,_rgba(198,122,48,0.18),_transparent_60%)]" />
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-14 md:px-10 lg:px-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]"
            >
              Restopickup
            </Link>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-[var(--color-border)] bg-white/70 px-4 py-2 text-sm text-[var(--color-muted)]">
                {cartCount} en carrito
              </span>
              <span className="rounded-full border border-[var(--color-border)] bg-white/70 px-4 py-2 text-sm text-[var(--color-muted)]">
                Retiro en local
              </span>
              <span className="rounded-full border border-[var(--color-border)] bg-white/70 px-4 py-2 text-sm text-[var(--color-muted)]">
                {business.currencyCode}
              </span>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                Local abierto para retirar
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-5xl">
                {business.name}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--color-muted)]">
                Pedí online y pasá a buscar tu pedido por mostrador. El catálogo
                se carga en tiempo real desde Supabase y refleja los productos
                activos del local.
              </p>
            </div>

            <div className="rounded-[2rem] border border-[var(--color-border)] bg-white/80 p-6 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                Retiro
              </p>
              <p className="mt-4 text-lg font-medium text-[var(--color-foreground)]">
                {business.pickupAddress}
              </p>
              {business.pickupInstructions ? (
                <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                  {business.pickupInstructions}
                </p>
              ) : null}
              {business.contactPhone ? (
                <p className="mt-4 text-sm font-medium text-[var(--color-foreground)]">
                  Contacto: {business.contactPhone}
                </p>
              ) : null}
            </div>
          </div>

          {categoriesWithProducts.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {categoriesWithProducts.map((category) => (
                <CategoryShortcut
                  key={category.id}
                  category={category}
                  productCount={category.products.length}
                />
              ))}
              {uncategorizedProducts.length > 0 ? (
                <a
                  href="#destacados"
                  className="rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  Destacados
                  <span className="ml-2 text-[var(--color-muted)]">
                    {uncategorizedProducts.length}
                  </span>
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-12 md:px-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-12">
        <div className="flex flex-col gap-12">
          {categoriesWithProducts.length === 0 && uncategorizedProducts.length === 0 ? (
            <EmptyState
              eyebrow="Catalogo vacio"
              title="Este local todavia no publico productos"
              description="Cuando el negocio cargue categorias y productos activos, vas a poder verlos aca listos para retiro."
            />
          ) : null}

          {categoriesWithProducts.map((category) => (
            <section key={category.id} id={category.slug} className="scroll-mt-24">
              <div className="mb-6 flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                  Categoria
                </p>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
                      {category.name}
                    </h2>
                    {category.description ? (
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
                        {category.description}
                      </p>
                    ) : null}
                  </div>
                  <p className="hidden text-sm text-[var(--color-muted)] md:block">
                    {category.products.length} opciones
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {category.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(
                      item,
                      lineId,
                      selectedOptions,
                      unitOptionsAmount,
                      customerNote
                    ) =>
                      addItem(
                        {
                          businessId: business.id,
                          businessSlug: business.slug,
                          businessName: business.name,
                          currencyCode: business.currencyCode,
                        },
                        item,
                        lineId,
                        selectedOptions,
                        unitOptionsAmount,
                        customerNote
                      )
                    }
                  />
                ))}
              </div>
            </section>
          ))}

          {uncategorizedProducts.length > 0 ? (
            <section id="destacados" className="scroll-mt-24">
              <div className="mb-6 flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                  Seleccion
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
                  Productos destacados
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {uncategorizedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(
                      item,
                      lineId,
                      selectedOptions,
                      unitOptionsAmount,
                      customerNote
                    ) =>
                      addItem(
                        {
                          businessId: business.id,
                          businessSlug: business.slug,
                          businessName: business.name,
                          currencyCode: business.currencyCode,
                        },
                        item,
                        lineId,
                        selectedOptions,
                        unitOptionsAmount,
                        customerNote
                      )
                    }
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <CartSummaryPanel
          businessId={business.id}
          businessSlug={business.slug}
          currencyCode={business.currencyCode}
        />
      </main>
    </div>
  );
}
