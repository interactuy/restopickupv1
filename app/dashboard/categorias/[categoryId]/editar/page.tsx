import Link from "next/link";
import { notFound } from "next/navigation";

import {
  deleteCategoryAction,
  updateCategoryAction,
} from "@/lib/dashboard/actions";
import {
  getDashboardCategoryById,
  requireAdminDashboardContext,
} from "@/lib/dashboard/server";

import { CategoryForm } from "@/components/dashboard/category-form";
import { SubmitButton } from "@/components/dashboard/submit-button";

type DashboardEditCategoryPageProps = {
  params: Promise<{
    categoryId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function DashboardEditCategoryPage({
  params,
  searchParams,
}: DashboardEditCategoryPageProps) {
  const context = await requireAdminDashboardContext("/dashboard/categorias");
  const { categoryId } = await params;
  const [category, query] = await Promise.all([
    getDashboardCategoryById(context.business.id, categoryId),
    searchParams,
  ]);

  if (!category) {
    notFound();
  }

  return (
    <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
        Categorías
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Editar categoría
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
            Ajustá el orden, la visibilidad y el contenido de esta sección del menú.
          </p>
        </div>
        <Link
          href="/dashboard/categorias"
          className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          Volver al listado
        </Link>
      </div>

      <div className="mt-8">
        <CategoryForm
          action={updateCategoryAction}
          category={category}
          submitLabel="Guardar cambios"
          pendingLabel="Guardando..."
          title={category.name}
          description={`Slug público: ${category.slug}`}
          error={query.error}
          success={query.success}
        />
      </div>

      <div className="mt-8 rounded-[1.75rem] border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-800">Eliminar categoría</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-red-700">
          Si la eliminás, los productos que la usen quedan sin categoría, pero no se
          pierden del catálogo.
        </p>

        <form action={deleteCategoryAction} className="mt-4">
          <input type="hidden" name="categoryId" value={category.id} />
          <SubmitButton
            label="Eliminar categoría"
            pendingLabel="Eliminando..."
            className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </form>
      </div>
    </section>
  );
}
