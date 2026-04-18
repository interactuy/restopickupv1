import Link from "next/link";

import {
  getBusinessApplications,
  requireInternalAdminContext,
  type BusinessApplicationStatus,
} from "@/lib/admin/server";
import {
  AdminPageHeader,
  AdminPanel,
  AdminStatusPill,
  adminTableClasses,
} from "@/components/admin/admin-ui";

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
  await requireInternalAdminContext("/admin/solicitudes");
  const query = await searchParams;
  const normalizedStatus =
    query.status === "approved" || query.status === "rejected" || query.status === "pending"
      ? query.status
      : "all";
  const applications = await getBusinessApplications(
    normalizedStatus === "all" ? undefined : normalizedStatus,
  );

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Solicitudes"
        title="Pipeline de nuevos locales"
        description="Revisión, aprobación y rechazo de negocios que entran desde la landing."
      />

      <div className="flex flex-wrap gap-2">
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
                  ? "rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
                  : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              }
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <AdminPanel
        title="Solicitudes"
        description={`${applications.length} resultado${applications.length === 1 ? "" : "s"} para este filtro.`}
      >
        {applications.length === 0 ? (
          <p className="px-5 py-4 text-sm text-slate-500">
            No hay solicitudes para este filtro.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className={adminTableClasses.table}>
              <thead className={adminTableClasses.thead}>
                <tr>
                  <th className={adminTableClasses.th}>Local</th>
                  <th className={adminTableClasses.th}>Contacto</th>
                  <th className={adminTableClasses.th}>Zona / retiro</th>
                  <th className={adminTableClasses.th}>Tipo</th>
                  <th className={adminTableClasses.th}>Estado</th>
                  <th className={adminTableClasses.th}>Fecha</th>
                  <th className={adminTableClasses.th}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id} className={adminTableClasses.row}>
                    <td className={adminTableClasses.td}>
                      <div className="font-medium text-slate-950">
                        {application.businessName}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {application.email}
                      </div>
                    </td>
                    <td className={adminTableClasses.td}>
                      <div>{application.contactName}</div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {application.phone ?? "Sin celular"}
                      </div>
                    </td>
                    <td className={`${adminTableClasses.td} text-slate-500`}>
                      <div>{application.city ?? "Sin ciudad"}</div>
                      <div className="mt-0.5 max-w-xs truncate text-xs">
                        {application.pickupAddress ?? "Sin dirección"}
                      </div>
                    </td>
                    <td className={`${adminTableClasses.td} text-slate-500`}>
                      <div>{application.businessType ?? "Sin tipo"}</div>
                      <div className="mt-0.5 text-xs">
                        {application.estimatedOrderVolume ?? "Sin volumen"}
                      </div>
                    </td>
                    <td className={adminTableClasses.td}>
                      <AdminStatusPill
                        tone={
                          application.status === "approved"
                            ? "success"
                            : application.status === "rejected"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {statusLabels[application.status]}
                      </AdminStatusPill>
                    </td>
                    <td className={`${adminTableClasses.td} text-slate-500`}>
                      {new Date(application.createdAt).toLocaleString("es-UY")}
                    </td>
                    <td className={adminTableClasses.td}>
                      <Link
                        href={`/admin/solicitudes/${application.id}`}
                        className="font-medium text-emerald-700 hover:text-emerald-800"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
