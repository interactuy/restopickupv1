import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getBusinessApplicationById,
  requireInternalAdminContext,
  type BusinessApplicationStatus,
} from "@/lib/admin/server";

import { BusinessApplicationReviewForm } from "@/components/admin/business-application-review-form";

type AdminApplicationDetailPageProps = {
  params: Promise<{
    applicationId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

const statusLabels: Record<BusinessApplicationStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
};

export default async function AdminApplicationDetailPage({
  params,
  searchParams,
}: AdminApplicationDetailPageProps) {
  await requireInternalAdminContext();
  const { applicationId } = await params;
  const [application, query] = await Promise.all([
    getBusinessApplicationById(applicationId),
    searchParams,
  ]);

  if (!application) {
    notFound();
  }

  return (
    <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
            Solicitud
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
            {application.businessName}
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
            Ingresó el {new Date(application.createdAt).toLocaleString("es-UY")} y
            hoy está en estado <strong>{statusLabels[application.status]}</strong>.
          </p>
        </div>

        <Link
          href="/admin/solicitudes"
          className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          Volver al listado
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <article className="rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
              Datos del contacto
            </h2>
            <dl className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Contacto
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-foreground)]">
                  {application.contactName}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Email
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-foreground)]">
                  {application.email}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Celular
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-foreground)]">
                  {application.phone ?? "Sin celular"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Ciudad
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-foreground)]">
                  {application.city ?? "Sin ciudad"}
                </dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Dirección de retiro
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-foreground)]">
                  {application.pickupAddress ?? "Sin dirección"}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
              Perfil del negocio
            </h2>
            <dl className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Tipo de negocio
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-foreground)]">
                  {application.businessType ?? "Sin tipo"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Instagram o web
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-foreground)]">
                  {application.instagramOrWebsite ?? "Sin dato"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Venta online actual
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-foreground)]">
                  {application.currentSalesChannels ?? "Sin dato"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Volumen estimado
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-foreground)]">
                  {application.estimatedOrderVolume ?? "Sin dato"}
                </dd>
              </div>
            </dl>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Mensaje
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-foreground)]">
                {application.message ?? "No dejó mensaje adicional."}
              </p>
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
              Estado administrativo
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              Cuando apruebes esta solicitud, Restopickup crea o reutiliza el negocio,
              prepara el acceso del responsable y envía el email para entrar.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Revisada el
                </p>
                <p className="mt-1 text-sm text-[var(--color-foreground)]">
                  {application.reviewedAt
                    ? new Date(application.reviewedAt).toLocaleString("es-UY")
                    : "Todavía no revisada"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Negocio vinculado
                </p>
                <p className="mt-1 text-sm text-[var(--color-foreground)]">
                  {application.approvedBusinessId ?? "Todavía no vinculado"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Usuario vinculado
                </p>
                <p className="mt-1 text-sm text-[var(--color-foreground)]">
                  {application.relatedUserId ?? "Todavía no vinculado"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Procesada el
                </p>
                <p className="mt-1 text-sm text-[var(--color-foreground)]">
                  {application.processedAt
                    ? new Date(application.processedAt).toLocaleString("es-UY")
                    : "Todavía no procesada"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Email de acceso
                </p>
                <p className="mt-1 text-sm text-[var(--color-foreground)]">
                  {application.accessEmailSentAt
                    ? `Enviado ${new Date(application.accessEmailSentAt).toLocaleString("es-UY")}`
                    : "Todavía no enviado"}
                </p>
              </div>
            </div>
          </article>
        </div>

        <aside className="rounded-[1.75rem] border border-[var(--color-border)] bg-white p-6">
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
            Revisar solicitud
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
            Cambiá el estado y dejá notas internas para que el paso siguiente quede
            claro para el equipo.
          </p>

          <div className="mt-6">
            <BusinessApplicationReviewForm
              application={application}
              error={query.error}
              success={query.success}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}
