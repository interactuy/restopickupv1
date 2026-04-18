"use client";

import { updateOrderStatusAction } from "@/lib/dashboard/actions";

import { useFormStatus } from "react-dom";

type OrderStatusFormProps = {
  orderId: string;
  statusCode: string;
  businessSlug: string;
  orderNumber: number;
  submitLabel?: string;
};

const statusActions: Record<
  string,
  Array<{
    value: string;
    label: string;
    tone: "primary" | "success" | "neutral" | "danger";
  }>
> = {
  pending: [
    { value: "preparing", label: "En preparación", tone: "primary" },
    { value: "ready_for_pickup", label: "Marcar listo", tone: "success" },
    { value: "canceled", label: "Cancelar", tone: "danger" },
  ],
  confirmed: [
    { value: "preparing", label: "En preparación", tone: "primary" },
    { value: "ready_for_pickup", label: "Marcar listo", tone: "success" },
    { value: "canceled", label: "Cancelar", tone: "danger" },
  ],
  preparing: [
    { value: "ready_for_pickup", label: "Marcar listo", tone: "success" },
    { value: "completed", label: "Entregar", tone: "primary" },
    { value: "canceled", label: "Cancelar", tone: "danger" },
  ],
  ready_for_pickup: [
    { value: "completed", label: "Entregar", tone: "primary" },
    { value: "preparing", label: "Volver a preparación", tone: "neutral" },
  ],
  completed: [],
  canceled: [],
};

function StatusActionButtons({
  actions,
}: {
  actions: NonNullable<(typeof statusActions)[string]>;
}) {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.value}
          type="submit"
          name="statusCode"
          value={action.value}
          disabled={pending}
          className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
            action.tone === "primary"
              ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
              : action.tone === "success"
                ? "bg-[rgba(18,224,138,0.18)] text-[#008F53] hover:bg-[rgba(18,224,138,0.24)]"
                : action.tone === "danger"
                  ? "border border-red-200 bg-white text-red-700 hover:border-red-300 hover:bg-red-50"
                  : "border border-[var(--color-border)] bg-white text-[var(--color-foreground)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          }`}
        >
          {pending ? "Actualizando..." : action.label}
        </button>
      ))}
    </div>
  );
}

export function OrderStatusForm({
  orderId,
  statusCode,
  businessSlug,
  orderNumber,
  submitLabel = "Siguiente paso",
}: OrderStatusFormProps) {
  const actions = statusActions[statusCode] ?? [];

  if (actions.length === 0) {
    return null;
  }

  return (
    <form action={updateOrderStatusAction} className="space-y-2">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="businessSlug" value={businessSlug} />
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
        {submitLabel}
      </p>
      <StatusActionButtons actions={actions} />
    </form>
  );
}
