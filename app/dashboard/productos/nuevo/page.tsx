import Link from "next/link";

import { createProductAction } from "@/lib/dashboard/actions";
import {
  getDashboardCategories,
  requireAdminDashboardContext,
} from "@/lib/dashboard/server";

import { ProductForm } from "@/components/dashboard/product-form";

type DashboardNewProductPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function DashboardNewProductPage({
  searchParams,
}: DashboardNewProductPageProps) {
  const context = await requireAdminDashboardContext("/dashboard/productos/nuevo");
  const categories = await getDashboardCategories(context.business.id);
  const query = await searchParams;

  return (
    <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
        Productos
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Nuevo producto
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
            Sumá un producto nuevo al menú del local y definí su categoría, precio
            e imagen principal.
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
          action={createProductAction}
          categories={categories}
          submitLabel="Crear producto"
          pendingLabel="Creando..."
          title="Datos del producto"
          description="Si dejás el slug vacío, lo generamos automáticamente a partir del nombre."
          error={query.error}
        />
      </div>
    </section>
  );
}
