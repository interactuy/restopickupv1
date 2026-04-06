import Link from "next/link";

import {
  getBusinessApplications,
  requireInternalAdminContext,
  type BusinessApplicationStatus,
} from "@/lib/admin/server";

type AdminApplicationsPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

const statusLabels: Record<BusinessApplicationStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
};

const filters: { value: "all" | BusinessApplicationStatus; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "approved", label: "Aprobadas" },
  { value: "rejected", label: "Rechazadas" },
];

export default async function AdminApplicationsPage({
  searchParams,
}: AdminApplicationsPageProps) {
  await requireInternalAdminContext();
  const query = await searchParams;
  const normalizedStatus =
    query.status === "approved" || query.status === "rejected" || query.status === "pending"
      ? query.status
      : "all";
  const applications = await getBusinessApplications(
    normalizedStatus === "all" ? undefined : normalizedStatus,
  );

  return (
    <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
        Solicitudes
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Revisión de nuevos locales
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
            Acá revisan las solicitudes reales enviadas desde la landing y dejan
            preparada la aprobación manual antes de crear el negocio y el usuario owner.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {filters.map((filter) => {
          const href =
            filter.value === "all"
              ? "/admin/solicitudes"
              : `/admin/solicitudes?status=${filter.value}`;

          const isActive = normalizedStatus === filter.value;

          return (
            <Link
              key={filter.value}
              href={href}
              className={
                isActive
                  ? "inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white"
                  : "inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              }
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {applications.length === 0 ? (
        <div className="mt-8 rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-muted)]">
          No hay solicitudes para este filtro.
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-[var(--color-border)]">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-[var(--color-surface)] text-left text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                <tr>
                  <th className="px-4 py-4 font-semibold">Local</th>
                  <th className="px-4 py-4 font-semibold">Contacto</th>
                  <th className="px-4 py-4 font-semibold">Ciudad</th>
                  <th className="px-4 py-4 font-semibold">Tipo</th>
                  <th className="px-4 py-4 font-semibold">Estado</th>
                  <th className="px-4 py-4 font-semibold">Fecha</th>
                  <th className="px-4 py-4 font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr
                    key={application.id}
                    className="border-t border-[var(--color-border)] text-sm text-[var(--color-foreground)]"
                  >
                    <td className="px-4 py-4">
                      <div className="font-semibold">{application.businessName}</div>
                      <div className="mt-1 text-[var(--color-muted)]">
                        {application.email}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>{application.contactName}</div>
                      <div className="mt-1 text-[var(--color-muted)]">
                        {application.phone ?? "Sin celular"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[var(--color-muted)]">
                      {application.city ?? "Sin ciudad"}
                    </td>
                    <td className="px-4 py-4 text-[var(--color-muted)]">
                      {application.businessType ?? "Sin tipo"}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                        {statusLabels[application.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[var(--color-muted)]">
                      {new Date(application.createdAt).toLocaleString("es-UY")}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/solicitudes/${application.id}`}
                        className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
