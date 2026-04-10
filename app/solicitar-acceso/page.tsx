import Link from "next/link";

import { BusinessApplicationForm } from "@/components/public/business-application-form";

type AccessRequestPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

const processSteps = [
  {
    label: "Solicitud",
    title: "Nos pasás los datos reales del local.",
  },
  {
    label: "Revisión",
    title: "Revisamos operación, zona y próximos pasos.",
  },
  {
    label: "Alta",
    title: "Si avanzamos, creamos tu usuario y vinculamos el negocio.",
  },
  {
    label: "Onboarding",
    title: "Cargás branding, categorías, productos y pagos desde el dashboard.",
  },
];

const fitSignals = [
  "Locales con retiro por mostrador",
  "Catálogo claro y actualizable",
  "Operación preparada para pedidos digitales",
  "Interés en reducir espera y ordenar la demanda",
];

export default async function AccessRequestPage({
  searchParams,
}: AccessRequestPageProps) {
  const query = await searchParams;

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)]">
      <section className="relative border-b border-[rgba(92,59,34,0.12)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(198,90,46,0.16),transparent_32%),linear-gradient(135deg,#F7F4EF_0%,#FFFDFC_50%,#EDE4D9_100%)]" />
        <div className="absolute right-[-12rem] top-[-15rem] h-[34rem] w-[34rem] rounded-full bg-[rgba(63,92,78,0.12)] blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[-8rem] h-[28rem] w-[28rem] rounded-full bg-white/70 blur-3xl" />

        <div className="relative mx-auto flex min-h-[74vh] w-full max-w-[1560px] flex-col px-6 py-6 md:px-10 lg:px-14">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Restopickup
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] shadow-sm backdrop-blur transition hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)]"
            >
              Volver a la home
            </Link>
          </header>

          <div className="grid flex-1 gap-10 py-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(560px,1.08fr)] lg:items-center lg:py-16">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--color-secondary)]">
                Trabajá con Restopickup
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-[#21160f] md:text-7xl lg:text-8xl">
                Tu local, listo para vender sin sumar filas.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-[var(--color-muted)] md:text-lg">
                Restopickup ayuda a locales gastronómicos a recibir pedidos online
                para retiro. La solicitud no crea acceso automático: revisamos cada
                negocio y, si avanzamos, dejamos el dashboard listo para operar.
              </p>

              <div className="mt-9 grid gap-3 sm:grid-cols-2">
                {fitSignals.map((signal) => (
                  <div
                    key={signal}
                    className="rounded-2xl border border-[var(--color-border)] bg-white/58 px-4 py-3 text-sm font-semibold text-[#3b2a1f] shadow-sm backdrop-blur"
                  >
                    {signal}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2.25rem] border border-white/70 bg-white/82 p-3 shadow-[0_34px_110px_rgba(62,39,20,0.14)] backdrop-blur-xl">
              <div className="rounded-[1.85rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 md:p-7">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-secondary)]">
                      Solicitud de acceso
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#21160f]">
                      Contanos sobre tu local
                    </h2>
                  </div>
                  <span className="rounded-full border border-[rgba(47,122,74,0.22)] bg-[rgba(47,122,74,0.08)] px-3 py-1.5 text-xs font-semibold text-[var(--color-success)]">
                    Evaluación personalizada
                  </span>
                </div>

                <BusinessApplicationForm
                  error={query.error}
                  success={query.success}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-surface)]">
        <div className="mx-auto grid w-full max-w-[1560px] gap-6 px-6 py-10 md:px-10 lg:grid-cols-4 lg:px-14">
          {processSteps.map((step, index) => (
            <article
              key={step.label}
              className="border-l border-[var(--color-border)] pl-5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-secondary)] text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                  {step.label}
                </p>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-6 text-[var(--color-muted)]">
                {step.title}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
