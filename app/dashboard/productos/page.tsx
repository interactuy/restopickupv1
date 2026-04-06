import Link from "next/link";

import { formatPrice } from "@/lib/public-catalog";
import { getDashboardProducts, requireDashboardContext } from "@/lib/dashboard/server";

import { ProductAvailabilityForm } from "@/components/dashboard/product-availability-form";
import { EmptyState } from "@/components/public/empty-state";

type DashboardProductsPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

const successLabels: Record<string, string> = {
  deleted: "Producto eliminado correctamente.",
};

export default async function DashboardProductsPage({
  searchParams,
}: DashboardProductsPageProps) {
  const context = await requireDashboardContext();
  const [products, query] = await Promise.all([
    getDashboardProducts(context.business.id),
    searchParams,
  ]);
  const successMessage = query.success ? successLabels[query.success] ?? null : null;

  return (
    <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
        Productos
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Catálogo del local
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
            Gestioná el menú visible del local, la disponibilidad y el orden de cada producto.
          </p>
        </div>
        <Link
          href="/dashboard/productos/nuevo"
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
        >
          Nuevo producto
        </Link>
      </div>

      {query.error ? (
        <div className="mt-6 rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {query.error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-6 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {products.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            eyebrow="Sin productos"
            title="Todavía no hay productos cargados"
            description="Creá tu primer producto para empezar a armar el menú visible del local."
          />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {products.map((product) => (
            <article
              key={product.id}
              className="flex flex-wrap items-start justify-between gap-5 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[1.25rem] border border-[var(--color-border)] bg-white">
                  {product.image?.publicUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image.publicUrl}
                      alt={product.image.altText ?? product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-3 text-center text-xs text-[var(--color-muted)]">
                      Sin imagen
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                    {product.name}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {product.categoryName ?? "Sin categoría"} · {product.slug}
                  </p>
                  {product.description ? (
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
                      {product.description}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    Posición {product.position}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right sm:min-w-36">
                  <p className="text-sm font-medium text-[var(--color-muted)]">
                    {formatPrice(product.priceAmount, product.currencyCode)}
                  </p>
                  {product.compareAtAmount ? (
                    <p className="mt-1 text-xs text-[var(--color-muted)] line-through">
                      {formatPrice(product.compareAtAmount, product.currencyCode)}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm text-[var(--color-foreground)]">
                    {product.isAvailable ? "Disponible" : "No disponible"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <Link
                    href={`/dashboard/productos/${product.id}/editar`}
                    className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    Editar
                  </Link>
                  <ProductAvailabilityForm
                    productId={product.id}
                    isAvailable={product.isAvailable}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
