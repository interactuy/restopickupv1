import type { DashboardCategory, DashboardProduct } from "@/lib/dashboard/server";

import { ProductOptionGroupsEditor } from "@/components/dashboard/product-option-groups-editor";
import { SubmitButton } from "@/components/dashboard/submit-button";

type ProductFormProps = {
  action: (formData: FormData) => Promise<void>;
  categories: DashboardCategory[];
  product?: DashboardProduct | null;
  submitLabel: string;
  pendingLabel: string;
  title: string;
  description: string;
  error?: string;
  success?: string;
};

const successLabels: Record<string, string> = {
  created: "Producto creado correctamente.",
  updated: "Cambios guardados correctamente.",
};

export function ProductForm({
  action,
  categories,
  product,
  submitLabel,
  pendingLabel,
  title,
  description,
  error,
  success,
}: ProductFormProps) {
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
        {product ? <input type="hidden" name="productId" value={product.id} /> : null}

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
              defaultValue={product?.name ?? ""}
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
              defaultValue={product?.slug ?? ""}
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
            defaultValue={product?.description ?? ""}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="priceAmount"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Precio
            </label>
            <input
              id="priceAmount"
              name="priceAmount"
              inputMode="numeric"
              defaultValue={product?.priceAmount ?? ""}
              placeholder="390"
              required
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
            />
            <p className="mt-2 text-xs text-[var(--color-muted)]">
              Ingresá el entero final en {product?.currencyCode ?? "UYU"}.
            </p>
          </div>

          <div>
            <label
              htmlFor="compareAtAmount"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Precio anterior
            </label>
            <input
              id="compareAtAmount"
              name="compareAtAmount"
              inputMode="numeric"
              defaultValue={product?.compareAtAmount ?? ""}
              placeholder="520"
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
            />
          </div>

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
              defaultValue={product?.position ?? 0}
              required
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="isAvailable"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Disponibilidad
            </label>
            <select
              id="isAvailable"
              name="isAvailable"
              defaultValue={String(product?.isAvailable ?? true)}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
            >
              <option value="true">Disponible</option>
              <option value="false">No disponible</option>
            </select>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <label
              htmlFor="categoryId"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Categoría
            </label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={product?.categoryId ?? ""}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
            >
              <option value="">Sin categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="image"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Foto principal
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="block w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-foreground)] outline-none file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium"
            />
            <p className="mt-2 text-xs text-[var(--color-muted)]">
              JPG, PNG o WEBP. Máximo sugerido: 5 MB.
            </p>
          </div>
        </div>

        {product?.image ? (
          <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-sm font-medium text-[var(--color-foreground)]">
              Imagen actual
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="h-28 w-28 overflow-hidden rounded-[1.25rem] bg-white">
                {product.image.publicUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image.publicUrl}
                    alt={product.image.altText ?? product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-3 text-center text-xs text-[var(--color-muted)]">
                    Imagen sin URL pública
                  </div>
                )}
              </div>
              <div className="text-sm text-[var(--color-muted)]">
                {product.image.altText ?? "Sin texto alternativo"}
              </div>
            </div>
          </div>
        ) : null}

        <ProductOptionGroupsEditor
          initialGroups={
            product?.optionGroups.map((group) => ({
              id: group.id,
              name: group.name,
              description: group.description ?? "",
              selectionType: group.selectionType,
              isRequired: group.isRequired,
              minSelect: group.minSelect,
              maxSelect: group.maxSelect,
              position: group.position,
              items: group.items.map((item) => ({
                id: item.id,
                name: item.name,
                priceDeltaAmount: item.priceDeltaAmount,
                isActive: item.isActive,
                position: item.position,
              })),
            })) ?? []
          }
        />

        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton label={submitLabel} pendingLabel={pendingLabel} />
        </div>
      </form>
    </div>
  );
}
