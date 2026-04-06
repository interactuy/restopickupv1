import type { AdminBusinessApplication } from "@/lib/admin/server";
import { updateBusinessApplicationAction } from "@/lib/admin/actions";

import { SubmitButton } from "@/components/dashboard/submit-button";

type BusinessApplicationReviewFormProps = {
  application: AdminBusinessApplication;
  error?: string;
  success?: string;
};

export function BusinessApplicationReviewForm({
  application,
  error,
  success,
}: BusinessApplicationReviewFormProps) {
  return (
    <div className="space-y-5">
      {error ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success === "updated" ? (
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Solicitud actualizada correctamente.
        </div>
      ) : null}

      <form action={updateBusinessApplicationAction} className="space-y-5">
        <input type="hidden" name="applicationId" value={application.id} />

        <div>
          <label
            htmlFor="status"
            className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Estado
          </label>
          <select
            id="status"
            name="status"
            defaultValue={application.status}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
          >
            <option value="pending">Pendiente</option>
            <option value="approved">Aprobada</option>
            <option value="rejected">Rechazada</option>
          </select>
          <p className="mt-2 text-xs leading-6 text-[var(--color-muted)]">
            Si elegís <strong>Aprobada</strong>, el sistema crea el negocio si hace
            falta, genera o reutiliza el usuario owner, lo vincula al negocio y
            envía el email de acceso.
          </p>
        </div>

        <div>
          <label
            htmlFor="reviewNotes"
            className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Notas internas
          </label>
          <textarea
            id="reviewNotes"
            name="reviewNotes"
            rows={6}
            defaultValue={application.reviewNotes ?? ""}
            placeholder="Anotaciones internas para el equipo: contexto comercial, próximos pasos, motivo de rechazo, etc."
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
          />
        </div>

        <SubmitButton label="Guardar revisión" pendingLabel="Guardando..." />
      </form>
    </div>
  );
}
