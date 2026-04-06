import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteProductAction, updateProductAction } from "@/lib/dashboard/actions";
import {
  getDashboardCategories,
  getDashboardProductById,
  requireDashboardContext,
} from "@/lib/dashboard/server";

import { ProductForm } from "@/components/dashboard/product-form";
import { SubmitButton } from "@/components/dashboard/submit-button";

type DashboardEditProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function DashboardEditProductPage({
  params,
  searchParams,
}: DashboardEditProductPageProps) {
  const context = await requireDashboardContext();
  const { productId } = await params;
  const [categories, product, query] = await Promise.all([
    getDashboardCategories(context.business.id),
    getDashboardProductById(context.business.id, productId),
    searchParams,
  ]);

  if (!product) {
    notFound();
  }

  return (
    <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
        Productos
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Editar producto
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
            Actualizá el menú del local, reemplazá la foto principal o ajustá la
            disponibilidad del producto.
          </p>
        </div>
        <Link
          href="/dashboard/productos"
          className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          Volver al listado
        </Link>
      </div>

      <div className="mt-8">
        <ProductForm
          action={updateProductAction}
          categories={categories}
          product={product}
          submitLabel="Guardar cambios"
          pendingLabel="Guardando..."
          title={product.name}
          description={`Slug público: ${product.slug}`}
          error={query.error}
          success={query.success}
        />
      </div>

      <div className="mt-8 rounded-[1.75rem] border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-800">Eliminar producto</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-red-700">
          Esta acción elimina el producto del menú. Los pedidos históricos se
          conservan porque sus ítems guardan snapshot del nombre y precio.
        </p>

        <form action={deleteProductAction} className="mt-4">
          <input type="hidden" name="productId" value={product.id} />
          <SubmitButton
            label="Eliminar producto"
            pendingLabel="Eliminando..."
            className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </form>
      </div>
    </section>
  );
}
