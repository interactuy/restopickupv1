import {
  getAdminPlatformSettings,
  requireInternalAdminContext,
} from "@/lib/admin/server";
import { updatePlatformSettingsAction } from "@/lib/admin/actions";
import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";

import { SubmitButton } from "@/components/dashboard/submit-button";

type AdminPlatformPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function AdminPlatformPage({
  searchParams,
}: AdminPlatformPageProps) {
  await requireInternalAdminContext("/admin/plataforma");
  const [settings, query] = await Promise.all([
    getAdminPlatformSettings(),
    searchParams,
  ]);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Plataforma"
        title="Configuración global"
        description="Comisión por defecto, feature flags simples, textos globales y ajustes operativos."
      />

      {query.error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {query.error}
        </div>
      ) : null}

      {query.success === "updated" ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Configuración actualizada correctamente.
        </div>
      ) : null}

      <AdminPanel
        title="Comercial"
        description="La comisión global es referencia; cada local puede tener una comisión personalizada."
      >
        <form action={updatePlatformSettingsAction} className="max-w-xl space-y-4 px-5 py-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-950">
              Comisión global por defecto
            </span>
            <input
              type="number"
              name="defaultCommissionPercent"
              min="0"
              max="100"
              step="0.01"
              defaultValue={(settings.defaultCommissionBps / 100).toFixed(2)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </label>

          <SubmitButton
            label="Guardar configuración"
            pendingLabel="Guardando..."
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </form>
      </AdminPanel>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminPanel title="Feature flags">
          <pre className="overflow-x-auto p-5 text-xs text-slate-500">
            {JSON.stringify(settings.featureFlags, null, 2)}
          </pre>
        </AdminPanel>

        <AdminPanel title="Textos globales">
          <pre className="overflow-x-auto p-5 text-xs text-slate-500">
            {JSON.stringify(settings.globalTexts, null, 2)}
          </pre>
        </AdminPanel>
      </div>
    </div>
  );
}
