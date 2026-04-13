import { updateOrderEstimatedReadyAtAction } from "@/lib/dashboard/actions";

import { SubmitButton } from "@/components/dashboard/submit-button";

type OrderReadyTimeFormProps = {
  orderId: string;
  businessSlug: string;
  orderNumber: number;
  defaultMinutes: number;
  submitLabel?: string;
};

export function OrderReadyTimeForm({
  orderId,
  businessSlug,
  orderNumber,
  defaultMinutes,
  submitLabel = "Actualizar retiro",
}: OrderReadyTimeFormProps) {
  return (
    <form action={updateOrderEstimatedReadyAtAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="businessSlug" value={businessSlug} />
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <div>
        <label
          htmlFor={`estimatedMinutes-${orderId}`}
          className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]"
        >
          Listo en
        </label>
        <div className="flex items-center gap-2">
          <input
            id={`estimatedMinutes-${orderId}`}
            name="estimatedMinutes"
            type="number"
            min={0}
            max={240}
            defaultValue={defaultMinutes}
            className="w-24 rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none"
          />
          <span className="text-sm text-[var(--color-muted)]">min</span>
        </div>
      </div>
      <SubmitButton
        label={submitLabel}
        pendingLabel="Guardando..."
        className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground)] transition enabled:hover:border-[var(--color-accent)] enabled:hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
      />
    </form>
  );
}
