import type { DashboardCategory } from "@/lib/dashboard/server";

import { SubmitButton } from "@/components/dashboard/submit-button";

type CategoryFormProps = {
  action: (formData: FormData) => Promise<void>;
  category?: DashboardCategory | null;
  submitLabel: string;
  pendingLabel: string;
  title: string;
  description: string;
  error?: string;
  success?: string;
};

const successLabels: Record<string, string> = {
  created: "Categoría creada correctamente.",
  updated: "Categoría actualizada correctamente.",
};

export function CategoryForm({
  action,
  category,
  submitLabel,
  pendingLabel,
  title,
  description,
  error,
  success,
}: CategoryFormProps) {
  const successMessage = success ? successLabels[success] ?? null : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
          {description}
        </p>
      </div>

      {error ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <form action={action} className="space-y-5">
        {category ? <input type="hidden" name="categoryId" value={category.id} /> : null}

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Nombre
            </label>
            <input
              id="name"
              name="name"
              defaultValue={category?.name ?? ""}
              required
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              defaultValue={category?.slug ?? ""}
              placeholder="Se genera desde el nombre si lo dejás vacío"
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={category?.description ?? ""}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="position"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Posición
            </label>
            <input
              id="position"
              name="position"
              inputMode="numeric"
              defaultValue={category?.position ?? 0}
              required
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="isActive"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Estado
            </label>
            <select
              id="isActive"
              name="isActive"
              defaultValue={String(category?.isActive ?? true)}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
            >
              <option value="true">Activa</option>
              <option value="false">Oculta</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton label={submitLabel} pendingLabel={pendingLabel} />
        </div>
      </form>
    </div>
  );
}
