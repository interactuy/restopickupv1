import {
  requestAdminPinResetAction,
  updateAdminPinAction,
} from "@/lib/dashboard/actions";
import { requireAdminDashboardContext } from "@/lib/dashboard/server";

import { SubmitButton } from "@/components/dashboard/submit-button";
import { BusinessSettingsForm } from "@/components/dashboard/business-settings-form";

type DashboardSettingsPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function DashboardSettingsPage({
  searchParams,
}: DashboardSettingsPageProps) {
  const context = await requireAdminDashboardContext("/dashboard/configuracion");
  const query = await searchParams;
  const feedback =
    query.success === "pin-updated"
      ? "PIN admin actualizado."
      : query.success === "pin-reset-sent"
        ? "Te enviamos un email para resetear el PIN."
        : query.success === "pin-reset"
          ? "PIN admin actualizado desde el link de reset."
          : query.error === "pin-current-invalid"
            ? "El PIN actual no coincide."
            : query.error === "pin-mismatch"
              ? "Los PIN nuevos no coinciden."
              : query.error === "pin-format"
                ? "El PIN debe tener 4 dígitos."
                : query.error === "pin-reset-email"
                  ? "No encontramos un email para enviar el reset del PIN."
                  : null;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
          Configuración
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
          Datos básicos del local
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
          Actualizá la información visible del negocio, su branding y la operativa de retiro.
        </p>

        <div className="mt-8">
          <BusinessSettingsForm business={context.business} />
        </div>
      </section>

      <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
          Seguridad admin
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
          PIN de modo admin
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
          Este PIN de 4 dígitos desbloquea estadísticas, pagos y configuración general cuando el local usa un dispositivo compartido.
        </p>

        {feedback ? (
          <div className="mt-6 rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-foreground)]">
            {feedback}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <form action={updateAdminPinAction} className="space-y-4 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <div>
              <label htmlFor="currentPin" className="mb-2 block text-sm font-medium text-[var(--color-foreground)]">
                PIN actual
              </label>
              <input
                id="currentPin"
                name="currentPin"
                inputMode="numeric"
                maxLength={4}
                placeholder="1234"
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="nextPin" className="mb-2 block text-sm font-medium text-[var(--color-foreground)]">
                  Nuevo PIN
                </label>
                <input
                  id="nextPin"
                  name="nextPin"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="1234"
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none"
                />
              </div>
              <div>
                <label htmlFor="nextPinConfirmation" className="mb-2 block text-sm font-medium text-[var(--color-foreground)]">
                  Confirmar PIN
                </label>
                <input
                  id="nextPinConfirmation"
                  name="nextPinConfirmation"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="1234"
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none"
                />
              </div>
            </div>
            <SubmitButton label="Actualizar PIN" pendingLabel="Guardando PIN..." />
          </form>

          <form action={requestAdminPinResetAction} className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <p className="text-sm font-semibold text-[var(--color-foreground)]">
              ¿Olvidaste el PIN?
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              Enviamos un link de reset al email del usuario o al contacto principal del local.
            </p>
            <div className="mt-5">
              <SubmitButton label="Olvidé el PIN" pendingLabel="Enviando..." />
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
