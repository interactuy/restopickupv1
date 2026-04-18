import Link from "next/link";

import { updateSupportIncidentStatusAction } from "@/lib/admin/actions";
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

const sourceLabels = {
  internal: "Interno",
  commercial: "Comercial",
  support: "Soporte",
};

type AdminSupportPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function AdminSupportPage({ searchParams }: AdminSupportPageProps) {
  await requireInternalAdminContext("/admin/soporte");
  const query = await searchParams;
  const incidents = await getAdminSupportIncidents();
  const feedback =
    query.success === "support-updated"
      ? "Ticket actualizado correctamente."
      : query.error === "support-save"
        ? "No pudimos actualizar el ticket."
        : query.error === "invalid-support-status"
          ? "Estado de ticket inválido."
          : null;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Soporte"
        title="Incidencias de locales"
        description="Lugar para centralizar reclamos, consultas operativas y seguimiento de tickets."
      />

      {feedback ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-700">
          {feedback}
        </div>
      ) : null}

      <AdminPanel
        title="Tickets de soporte"
        description={`${incidents.length} incidencia${incidents.length === 1 ? "" : "s"} cargada${incidents.length === 1 ? "" : "s"}.`}
      >
        {incidents.length === 0 ? (
          <p className="px-5 py-4 text-sm text-slate-500">
            No hay incidencias cargadas.
          </p>
        ) : (
          <div className="divide-y divide-slate-200">
            {incidents.map((incident) => {
              const emailSubject = encodeURIComponent(
                `Ticket #${incident.ticketNumber ?? "-"} · ${incident.title}`
              );
              const emailBody = encodeURIComponent(
                `Hola ${incident.requesterName ?? ""},\n\nTe escribimos por tu ticket #${incident.ticketNumber ?? "-"}.\n\n`
              );
              const emailHref = incident.requesterEmail
                ? `mailto:${incident.requesterEmail}?subject=${emailSubject}&body=${emailBody}`
                : null;
              const whatsappHref = incident.requesterPhone
                ? `https://wa.me/${incident.requesterPhone.replace(/\D/g, "")}`
                : null;

              return (
              <article key={incident.id} className="space-y-4 px-5 py-5 hover:bg-slate-50">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {incident.ticketNumber ? (
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Ticket #{incident.ticketNumber}
                        </span>
                      ) : null}
                      <h2 className="font-medium text-slate-950">{incident.title}</h2>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {incident.businessId ? (
                        <Link
                          href={`/admin/negocios/${incident.businessId}`}
                          className="hover:text-emerald-700"
                        >
                          {incident.businessName}
                        </Link>
                      ) : (
                        incident.businessName
                      )}{" "}
                      · {new Date(incident.createdAt).toLocaleString("es-UY")}
                    </p>
                    {incident.requesterName || incident.requesterEmail ? (
                      <p className="mt-1 text-sm text-slate-500">
                        {incident.requesterName ?? "Sin nombre"} · {incident.requesterEmail ?? "Sin email"}
                      </p>
                    ) : null}
                    {incident.requesterPhone ? (
                      <p className="mt-1 text-sm text-slate-500">
                        {incident.requesterPhone}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AdminStatusPill tone="neutral">
                      {sourceLabels[incident.source]}
                    </AdminStatusPill>
                    <AdminStatusPill tone={incident.status === "resolved" ? "success" : "warning"}>
                      {statusLabels[incident.status]}
                    </AdminStatusPill>
                    <AdminStatusPill tone={incident.severity === "high" ? "danger" : "neutral"}>
                      {severityLabels[incident.severity]}
                    </AdminStatusPill>
                  </div>
                </div>
                {incident.notes ? (
                  <p className="text-sm leading-6 text-slate-500 whitespace-pre-line">{incident.notes}</p>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <form action={updateSupportIncidentStatusAction} className="flex flex-wrap gap-2">
                    <input type="hidden" name="incidentId" value={incident.id} />
                    {(["open", "in_progress", "resolved"] as const).map((status) => (
                      <button
                        key={status}
                        type="submit"
                        name="status"
                        value={status}
                        className={`inline-flex items-center justify-center rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                          incident.status === status
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                        }`}
                      >
                        {statusLabels[status]}
                      </button>
                    ))}
                  </form>

                  <div className="flex flex-wrap gap-2">
                    {emailHref ? (
                      <Link
                        href={emailHref}
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 transition hover:border-slate-400"
                      >
                        Enviar email
                      </Link>
                    ) : null}
                    {whatsappHref ? (
                      <Link
                        href={whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 transition hover:border-slate-400"
                      >
                        WhatsApp
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            )})}
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
