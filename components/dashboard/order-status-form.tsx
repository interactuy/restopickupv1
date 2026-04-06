import { updateOrderStatusAction } from "@/lib/dashboard/actions";

import { SubmitButton } from "@/components/dashboard/submit-button";

type OrderStatusFormProps = {
  orderId: string;
  statusCode: string;
};

const statusOptions = [
  { value: "pending", label: "Pendiente" },
  { value: "preparing", label: "En preparacion" },
  { value: "ready_for_pickup", label: "Listo para retirar" },
  { value: "completed", label: "Entregado" },
  { value: "canceled", label: "Cancelado" },
];

export function OrderStatusForm({
  orderId,
  statusCode,
}: OrderStatusFormProps) {
  return (
    <form action={updateOrderStatusAction} className="flex flex-wrap gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      <select
        name="statusCode"
        defaultValue={statusCode}
        className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <SubmitButton label="Actualizar" pendingLabel="Actualizando..." />
    </form>
  );
}
