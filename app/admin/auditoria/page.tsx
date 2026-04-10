import { getAdminAuditLogs, requireInternalAdminContext } from "@/lib/admin/server";
import { AdminPageHeader, AdminPanel, adminTableClasses } from "@/components/admin/admin-ui";

export default async function AdminAuditPage() {
  await requireInternalAdminContext();
  const logs = await getAdminAuditLogs();

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Auditoría"
        title="Historial administrativo"
        description="Registro de acciones sensibles del backoffice: cambios de comisión, plataforma y futuros cambios importantes."
      />

      <AdminPanel title="Eventos" description={`${logs.length} eventos recientes.`}>
        <div className="overflow-x-auto">
          <table className={adminTableClasses.table}>
            <thead className={adminTableClasses.thead}>
              <tr>
                <th className={adminTableClasses.th}>Fecha</th>
                <th className={adminTableClasses.th}>Acción</th>
                <th className={adminTableClasses.th}>Entidad</th>
                <th className={adminTableClasses.th}>Usuario</th>
                <th className={adminTableClasses.th}>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className={adminTableClasses.row}>
                  <td className={`${adminTableClasses.td} text-slate-500`}>
                    {new Date(log.createdAt).toLocaleString("es-UY")}
                  </td>
                  <td className={`${adminTableClasses.td} font-medium text-slate-950`}>
                    {log.action}
                  </td>
                  <td className={`${adminTableClasses.td} text-slate-500`}>
                    {log.entityType} · {log.entityId}
                  </td>
                  <td className={`${adminTableClasses.td} text-slate-500`}>
                    {log.actorUserId ?? "Sistema"}
                  </td>
                  <td className={adminTableClasses.td}>
                    <code className="whitespace-pre-wrap rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-500">
                      {JSON.stringify(log.metadata)}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}
