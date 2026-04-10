import Link from "next/link";

import { getAdminSupportIncidents, requireInternalAdminContext } from "@/lib/admin/server";
import { AdminPageHeader, AdminPanel, AdminStatusPill } from "@/components/admin/admin-ui";

const statusLabels = {
  open: "Abierta",
  in_progress: "En curso",
  resolved: "Resuelta",
};

const severityLabels = {
  low: "Baja",
  normal: "Normal",
  high: "Alta",
};

export default async function AdminSupportPage() {
  await requireInternalAdminContext();
  const incidents = await getAdminSupportIncidents();

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Soporte"
        title="Incidencias de locales"
        description="Base para centralizar problemas operativos, técnicos o comerciales de cada local."
      />

      <AdminPanel
        title="Incidencias"
        description={`${incidents.length} incidencia${incidents.length === 1 ? "" : "s"} cargada${incidents.length === 1 ? "" : "s"}.`}
      >
        {incidents.length === 0 ? (
          <p className="px-5 py-4 text-sm text-slate-500">
            No hay incidencias cargadas.
          </p>
        ) : (
          <div className="divide-y divide-slate-200">
            {incidents.map((incident) => (
              <article key={incident.id} className="px-5 py-4 hover:bg-slate-50">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-medium text-slate-950">{incident.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      <Link
                        href={`/admin/negocios/${incident.businessId}`}
                        className="hover:text-emerald-700"
                      >
                        {incident.businessName}
                      </Link>{" "}
                      · {new Date(incident.createdAt).toLocaleString("es-UY")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AdminStatusPill tone={incident.status === "resolved" ? "success" : "warning"}>
                      {statusLabels[incident.status]}
                    </AdminStatusPill>
                    <AdminStatusPill tone={incident.severity === "high" ? "danger" : "neutral"}>
                      {severityLabels[incident.severity]}
                    </AdminStatusPill>
                  </div>
                </div>
                {incident.notes ? (
                  <p className="mt-3 text-sm leading-6 text-slate-500">{incident.notes}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
