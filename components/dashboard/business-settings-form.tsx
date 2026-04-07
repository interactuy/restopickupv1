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

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <label
            htmlFor="profileImage"
            className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Foto de perfil
          </label>
          <input
            id="profileImage"
            name="profileImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="block w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] outline-none file:mr-3 file:rounded-full file:border-0 file:bg-[var(--color-surface)] file:px-3 file:py-2 file:text-sm file:font-medium"
          />
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Ideal para logo o avatar del local.
          </p>
          {business.profileImageUrl ? (
            <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-[var(--color-border)] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={business.profileImageUrl}
                alt={business.name}
                className="h-32 w-full object-cover"
              />
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <label
            htmlFor="coverImage"
            className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Portada del menú
          </label>
          <input
            id="coverImage"
            name="coverImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="block w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] outline-none file:mr-3 file:rounded-full file:border-0 file:bg-[var(--color-surface)] file:px-3 file:py-2 file:text-sm file:font-medium"
          />
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Se usa en el hero público del menú.
          </p>
          {business.coverImageUrl ? (
            <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-[var(--color-border)] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={business.coverImageUrl}
                alt={`Portada de ${business.name}`}
                className="h-32 w-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </div>

      <SubmitButton label="Guardar cambios" pendingLabel="Guardando..." />
    </form>
  );
}
