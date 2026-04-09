import Link from "next/link";
import { redirect } from "next/navigation";

import { unlockAdminModeAction } from "@/lib/dashboard/actions";
import { requireDashboardContext } from "@/lib/dashboard/server";

import { SubmitButton } from "@/components/dashboard/submit-button";

type DashboardAdminModePageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function DashboardAdminModePage({
  searchParams,
}: DashboardAdminModePageProps) {
  const context = await requireDashboardContext();

  if (!context.membership.isAdminRole) {
    redirect("/dashboard/pedidos");
  }

  const query = await searchParams;
  const nextPath = query.next ?? "/dashboard";
  const errorMessage =
    query.error === "pin-invalid"
      ? "El PIN admin no coincide."
      : query.error === "pin-format"
        ? "El PIN debe tener exactamente 4 dígitos."
        : query.error === "pin-mismatch"
          ? "La confirmación del PIN no coincide."
          : null;

  return (
    <section className="mx-auto w-full max-w-2xl rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
        Modo admin
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--color-foreground)]">
        {context.hasAdminPinConfigured
          ? "Desbloqueá las funciones sensibles"
          : "Definí tu PIN admin"}
      </h1>
      <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
        {context.hasAdminPinConfigured
          ? "Este PIN habilita estadísticas, pagos y configuración general del local."
          : "La primera vez configurás un PIN de 4 dígitos para proteger el modo admin en dispositivos compartidos."}
      </p>

      {errorMessage ? (
        <div className="mt-6 rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <form action={unlockAdminModeAction} className="mt-8 space-y-5">
        <input type="hidden" name="next" value={nextPath} />
        <div>
          <label htmlFor="pin" className="mb-2 block text-sm font-medium text-[var(--color-foreground)]">
            PIN admin
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

        {!context.hasAdminPinConfigured ? (
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
        ) : null}

        <SubmitButton
          label={context.hasAdminPinConfigured ? "Entrar a modo admin" : "Guardar PIN y entrar"}
          pendingLabel="Validando..."
        />
      </form>

      <div className="mt-6">
        <Link
          href="/dashboard/pedidos"
          className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
        >
          Seguir en modo colaborador
        </Link>
      </div>
    </section>
  );
}
