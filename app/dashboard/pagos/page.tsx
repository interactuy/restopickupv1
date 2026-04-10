import {
  disconnectMercadoPagoConnectionAction,
  startMercadoPagoConnectAction,
} from "@/lib/dashboard/actions";
import { requireAdminDashboardContext } from "@/lib/dashboard/server";
import { getBusinessPaymentConnection } from "@/lib/mercadopago/accounts";

import { SubmitButton } from "@/components/dashboard/submit-button";

type DashboardPaymentsPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function DashboardPaymentsPage({
  searchParams,
}: DashboardPaymentsPageProps) {
  const context = await requireAdminDashboardContext("/dashboard/pagos");
  const connection = await getBusinessPaymentConnection(context.business.id);
  const query = await searchParams;
  const feedback =
    query.success === "mercadopago-connected"
      ? "Mercado Pago quedó conectado a este local."
      : query.success === "mercadopago-disconnected"
        ? "Mercado Pago quedó desconectado."
        : query.error === "mercadopago-oauth"
          ? "No pudimos completar la autorización con Mercado Pago."
          : query.error === "mercadopago-state"
            ? "La conexión con Mercado Pago venció o no pudimos validar el regreso."
            : query.error === "mercadopago-save"
              ? "No pudimos guardar la cuenta conectada de Mercado Pago."
              : null;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
          Pagos
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
          Mercado Pago del local
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          Conectá la cuenta propia del negocio para que los cobros entren directo ahí. Si todavía no hay una cuenta conectada, los pagos se procesan con la cuenta temporal de Restopickup.
        </p>

        {feedback ? (
          <div className="mt-6 rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-foreground)]">
            {feedback}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)]">
          <p className="text-sm font-semibold text-[var(--color-foreground)]">
            Estado de la conexión
          </p>
          <div className="mt-4 space-y-3 text-sm text-[var(--color-muted)]">
            <p>
              Estado actual:{" "}
              <span className="font-medium text-[var(--color-foreground)]">
                {connection?.status === "connected" ? "Conectado" : "Desconectado"}
              </span>
            </p>
            <p>
              Cuenta Mercado Pago:{" "}
              <span className="font-medium text-[var(--color-foreground)]">
                {connection?.mercadopagoUserId
                  ? `Usuario ${connection.mercadopagoUserId}`
                  : "Sin cuenta conectada"}
              </span>
            </p>
            <p>
              Modo:{" "}
              <span className="font-medium text-[var(--color-foreground)]">
                {connection?.liveMode ? "Producción" : "Pruebas"}
              </span>
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <form action={startMercadoPagoConnectAction}>
              <SubmitButton
                label={connection?.status === "connected" ? "Reconectar Mercado Pago" : "Conectar Mercado Pago"}
                pendingLabel="Redirigiendo..."
              />
            </form>

            {connection?.status === "connected" ? (
              <form action={disconnectMercadoPagoConnectionAction}>
                <SubmitButton
                  label="Desconectar"
                  pendingLabel="Desconectando..."
                  className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-foreground)] transition enabled:hover:border-[var(--color-accent)] enabled:hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
                />
              </form>
            ) : null}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)]">
          <p className="text-sm font-semibold text-[var(--color-foreground)]">
            Qué cambia al conectar
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-muted)]">
            <li>Los pagos nuevos se crean con la cuenta propia del negocio.</li>
            <li>El dinero de las ventas va directo a ese Mercado Pago.</li>
            <li>Las comisiones de Restopickup se pueden liquidar aparte, por período.</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
