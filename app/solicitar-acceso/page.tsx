import Link from "next/link";

import { BusinessApplicationForm } from "@/components/public/business-application-form";

type AccessRequestPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function AccessRequestPage({
  searchParams,
}: AccessRequestPageProps) {
  const query = await searchParams;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)]">
      <div className="absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_top,_rgba(198,122,48,0.2),_transparent_62%)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-8 md:px-10 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Restopickup
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Volver a la home
          </Link>
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div className="rounded-[2rem] border border-[var(--color-border)] bg-white/85 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
              Solicitar acceso
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">
              Sumá tu local a Restopickup
            </h1>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
              Si te interesa operar pedidos para retirar con una tienda simple y
              autogestionable, dejános tus datos. Revisamos cada caso manualmente
              antes de crear accesos.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Nos llega tu solicitud con datos reales del negocio.",
                "La revisamos y definimos si avanzamos con el alta.",
                "Si aprobamos, creamos el usuario owner y vinculamos el local.",
                "Después el negocio completa onboarding, categorías y catálogo desde el dashboard.",
              ].map((item, index) => (
                <div key={item} className="flex gap-3">
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-xs font-semibold text-[var(--color-accent)]">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-7 text-[var(--color-muted)]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/88 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
            <BusinessApplicationForm
              error={query.error}
              success={query.success}
            />
          </section>
        </section>
      </div>
    </main>
  );
}
