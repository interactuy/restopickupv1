import {
  disconnectMercadoPagoConnectionAction,
  startMercadoPagoConnectAction,
} from "@/lib/dashboard/actions";
import { requireAdminDashboardContext } from "@/lib/dashboard/server";
import { getBusinessPaymentConnection } from "@/lib/mercadopago/accounts";

import { AccordionSection } from "@/components/dashboard/accordion-section";
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
      <section className="border-b border-[var(--color-border)] pb-4">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
          Pagos
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
          Mercado Pago del local
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          Conectá la cuenta propia del negocio para que los cobros entren directo ahí. Si todavía no hay una cuenta conectada, los pagos se procesan con la cuenta temporal de Restopickup.
        </p>

        {feedback ? (
          <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-foreground)]">
            {feedback}
          </div>
        ) : null}
      </section>

      <AccordionSection
        title="Estado de la conexión"
        description="Conectá o reconectá la cuenta del negocio para que los cobros entren directo ahí."
        badge={connection?.status === "connected" ? "Conectado" : "Pendiente"}
        defaultOpen
      >
        <div className="space-y-6">
          <div className="space-y-3 text-sm text-[var(--color-muted)]">
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

          <div className="flex flex-wrap gap-3">
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
                  className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-foreground)] transition enabled:hover:border-[var(--color-accent)] enabled:hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
                />
              </form>
            ) : null}
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        title="Qué cambia al conectar"
        description="Un resumen rápido del impacto práctico para el local."
        badge="Contexto"
      >
        <ul className="space-y-3 text-sm leading-7 text-[var(--color-muted)]">
          <li>Los pagos nuevos se crean con la cuenta propia del negocio.</li>
          <li>El dinero de las ventas va directo a ese Mercado Pago.</li>
          <li>Las comisiones de Restopickup se pueden liquidar aparte, por período.</li>
        </ul>
      </AccordionSection>
    </div>
  );
}
