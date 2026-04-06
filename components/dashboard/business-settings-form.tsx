import { updateBusinessSettingsAction } from "@/lib/dashboard/actions";
import type { DashboardContext } from "@/lib/dashboard/server";

import { SubmitButton } from "@/components/dashboard/submit-button";

type BusinessSettingsFormProps = {
  business: DashboardContext["business"];
};

export function BusinessSettingsForm({ business }: BusinessSettingsFormProps) {
  return (
    <form action={updateBusinessSettingsAction} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Nombre del local
          </label>
          <input
            id="name"
            name="name"
            defaultValue={business.name}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="contactEmail"
            className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Email de contacto
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            defaultValue={business.contactEmail ?? ""}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="contactPhone"
            className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Celular de contacto
          </label>
          <input
            id="contactPhone"
            name="contactPhone"
            defaultValue={business.contactPhone ?? ""}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="pickupAddress"
            className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Dirección de retiro
          </label>
          <input
            id="pickupAddress"
            name="pickupAddress"
            defaultValue={business.pickupAddress}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="pickupInstructions"
          className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
        >
          Instrucciones de retiro
        </label>
        <textarea
          id="pickupInstructions"
          name="pickupInstructions"
          rows={5}
          defaultValue={business.pickupInstructions ?? ""}
          className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
        />
      </div>

      <SubmitButton label="Guardar cambios" pendingLabel="Guardando..." />
    </form>
  );
}
