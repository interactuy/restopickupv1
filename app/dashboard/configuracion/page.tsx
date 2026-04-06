import { requireDashboardContext } from "@/lib/dashboard/server";

import { BusinessSettingsForm } from "@/components/dashboard/business-settings-form";

export default async function DashboardSettingsPage() {
  const context = await requireDashboardContext();

  return (
    <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
        Configuración
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
        Datos básicos del local
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
        Actualizá la información visible del negocio y la operativa de retiro.
      </p>

      <div className="mt-8">
        <BusinessSettingsForm business={context.business} />
      </div>
    </section>
  );
}
