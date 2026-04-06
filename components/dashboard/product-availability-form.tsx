import { toggleProductAvailabilityAction } from "@/lib/dashboard/actions";

import { SubmitButton } from "@/components/dashboard/submit-button";

type ProductAvailabilityFormProps = {
  productId: string;
  isAvailable: boolean;
};

export function ProductAvailabilityForm({
  productId,
  isAvailable,
}: ProductAvailabilityFormProps) {
  return (
    <form action={toggleProductAvailabilityAction} className="flex items-center gap-3">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="nextValue" value={String(!isAvailable)} />
      <SubmitButton
        label={isAvailable ? "Desactivar" : "Activar"}
        pendingLabel="Guardando..."
        className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] transition enabled:hover:border-[var(--color-accent)] enabled:hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
      />
    </form>
  );
}
