import Link from "next/link";

import { createCategoryAction } from "@/lib/dashboard/actions";
import { getDashboardCategories, requireDashboardContext } from "@/lib/dashboard/server";

import { CategoryForm } from "@/components/dashboard/category-form";
import { EmptyState } from "@/components/public/empty-state";

type DashboardCategoriesPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

const successLabels: Record<string, string> = {
  deleted: "Categoría eliminada correctamente.",
};

export default async function DashboardCategoriesPage({
  searchParams,
}: DashboardCategoriesPageProps) {
  const context = await requireDashboardContext();
  const [categories, query] = await Promise.all([
    getDashboardCategories(context.business.id),
    searchParams,
  ]);
  const successMessage = query.success ? successLabels[query.success] ?? null : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
      <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
        <div className="border-b border-[var(--color-border)] px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
            Categorías
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Estructura del menú
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
            Creá, ordená y ocultá categorías para que el menú público del local quede
            bien organizado antes de cargar productos.
          </p>
        </div>

        {query.error ? (
          <div className="mx-5 mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {query.error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mx-5 mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        {categories.length === 0 ? (
          <div className="px-5 py-5">
            <EmptyState
              eyebrow="Sin categorías"
              title="Todavía no armaste secciones para el menú"
              description="Sumá categorías como burgers, wraps o bebidas para que después el cliente las vea ordenadas en la tienda pública."
            />
          </div>
        ) : (
          <div className="space-y-4 px-5 py-5">
            {categories.map((category) => (
              <article
                key={category.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                      {category.name}
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                        category.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {category.isActive ? "Activa" : "Oculta"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    {category.slug} · Posición {category.position}
                  </p>
                  {category.description ? (
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
                      {category.description}
                    </p>
                  ) : null}
                </div>

                <Link
                  href={`/dashboard/categorias/${category.id}/editar`}
                  className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  Editar
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-8 xl:sticky xl:top-6">
        <CategoryForm
          action={createCategoryAction}
          submitLabel="Crear categoría"
          pendingLabel="Creando..."
          title="Nueva categoría"
          description="Si dejás el slug vacío, lo generamos automáticamente a partir del nombre."
          error={undefined}
          success={undefined}
        />
      </section>
    </div>
  );
}
