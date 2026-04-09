import Link from "next/link";
import { redirect } from "next/navigation";

import { completeAdminPinResetAction } from "@/lib/dashboard/actions";
import { requireDashboardContext } from "@/lib/dashboard/server";

import { SubmitButton } from "@/components/dashboard/submit-button";

type DashboardAdminModeResetPageProps = {
  searchParams: Promise<{
    token?: string;
    error?: string;
  }>;
};

export default async function DashboardAdminModeResetPage({
  searchParams,
}: DashboardAdminModeResetPageProps) {
  const context = await requireDashboardContext();

  if (!context.membership.isAdminRole) {
    redirect("/dashboard/pedidos");
  }

  const query = await searchParams;
  const token = query.token;
  const errorMessage =
    query.error === "token-invalid"
      ? "El link de reset ya no es válido o venció."
      : query.error === "pin-format"
        ? "El PIN debe tener 4 dígitos."
        : query.error === "pin-mismatch"
          ? "La confirmación del PIN no coincide."
          : null;

  if (!token || token === "invalid") {
    redirect("/dashboard/configuracion?error=token-invalid");
  }

  return (
    <section className="mx-auto w-full max-w-2xl rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
        Reset de PIN
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--color-foreground)]">
        Elegí un PIN admin nuevo
      </h1>
      <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
        Este PIN vuelve a habilitar el modo admin para {context.business.name}.
      </p>

      {errorMessage ? (
        <div className="mt-6 rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <form action={completeAdminPinResetAction} className="mt-8 space-y-5">
        <input type="hidden" name="token" value={token} />
        <div>
          <label htmlFor="pin" className="mb-2 block text-sm font-medium text-[var(--color-foreground)]">
            Nuevo PIN
          </label>
          <input
            id="pin"
            name="pin"
            inputMode="numeric"
            maxLength={4}
            placeholder="1234"
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="pinConfirmation"
            className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Confirmar PIN
          </label>
          <input
            id="pinConfirmation"
            name="pinConfirmation"
            inputMode="numeric"
            maxLength={4}
            placeholder="1234"
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
          />
        </div>
        <SubmitButton label="Guardar PIN nuevo" pendingLabel="Actualizando..." />
      </form>

      <div className="mt-6">
        <Link
          href="/dashboard/configuracion"
          className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
        >
          Volver a configuración
        </Link>
      </div>
    </section>
  );
}
