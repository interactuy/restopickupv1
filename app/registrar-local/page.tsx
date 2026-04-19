import Link from "next/link";

import { BusinessApplicationForm } from "@/components/public/business-application-form";

type RegisterLocalPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

const processSteps = [
  {
    label: "Registro",
    title: "Nos dejás los datos básicos del local y de cómo operan hoy.",
  },
  {
    label: "Contacto",
    title: "Te contactamos para conversar sobre tu local y los próximos pasos.",
  },
  {
    label: "Configuración",
    title: "Definimos contigo la mejor forma de implementarlo en tu local.",
  },
  {
    label: "Activación",
    title: "Te enviamos el acceso para crear tu cuenta y empezar a operar.",
  },
];

const fitSignals = [
  "Pedidos anticipados con retiro por mostrador",
  "Ideal para locales con horas pico marcadas",
  "Revisión simple antes de activar acceso",
];

const valuePoints = [
  {
    title: "Captar demanda con poco tiempo",
    body: "Clientes que quieren pedir antes de llegar.",
  },
  {
    title: "Evitar ventas perdidas por la fila",
    body: "Especialmente en horas pico y zonas de alto tránsito.",
  },
  {
    title: "Ordenar mejor el retiro",
    body: "Con pago previo y preparación más clara.",
  },
];

export default async function RegisterLocalPage({
  searchParams,
}: RegisterLocalPageProps) {
  const query = await searchParams;

  return (
    <main className="min-h-screen bg-[#f7f3ec] text-[var(--color-foreground)]">
      <section className="border-b border-[rgba(92,59,34,0.12)] bg-white">
        <div className="mx-auto w-full max-w-[1180px] px-6 py-5 md:px-10">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Restopickup
            </Link>
            <Link
              href="/comercial"
              className="text-sm font-semibold text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]"
            >
              Volver
            </Link>
          </header>
        </div>
      </section>

      <section className="border-b border-[rgba(92,59,34,0.12)] bg-[#f7f3ec]">
        <div className="mx-auto w-full max-w-[980px] px-6 py-16 md:px-10 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--color-secondary)]">
              Solicitud de alta
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.05em] text-[#21160f] md:text-6xl">
              Registrá tu local para empezar con Restopickup
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[var(--color-muted)] md:text-lg">
              Dejanos los datos básicos de tu local y nos ponemos en contacto para
              avanzar con la configuración y la puesta en marcha.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {fitSignals.map((signal) => (
                <span
                  key={signal}
                  className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[#3b2a1f]"
                >
                  {signal}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(92,59,34,0.12)] bg-white">
        <div className="mx-auto grid w-full max-w-[1180px] gap-0 px-6 py-8 md:px-10 lg:grid-cols-3">
          {valuePoints.map((point, index) => (
            <article
              key={point.title}
              className={`py-4 lg:px-6 ${index > 0 ? "lg:border-l lg:border-[var(--color-border)]" : ""}`}
            >
              <p className="text-lg font-semibold tracking-tight text-[#21160f]">
                {point.title}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                {point.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-b border-[rgba(92,59,34,0.12)] bg-[#f7f3ec]">
        <div className="mx-auto w-full max-w-[1180px] px-6 py-14 md:px-10 md:py-16">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-start">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                Registro inicial
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#21160f]">
                Empezamos con un registro simple y después seguimos contigo.
              </h2>
              <p className="mt-5 text-base leading-8 text-[var(--color-muted)]">
                Este primer paso nos sirve para ordenar el contacto inicial y avanzar
                contigo en la configuración del local, los cobros y la puesta en marcha.
              </p>
            </div>

            <div className="rounded-[2rem] border border-[var(--color-border)] bg-white p-5 shadow-[0_18px_50px_rgba(56,35,21,0.06)] md:p-7">
              <BusinessApplicationForm
                error={query.error}
                success={query.success}
                mode="commercial"
                redirectPath="/registrar-local"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(92,59,34,0.12)] bg-white">
        <div className="mx-auto grid w-full max-w-[1180px] gap-6 px-6 py-12 md:px-10 lg:grid-cols-4">
          {processSteps.map((step, index) => (
            <article
              key={step.label}
              className="rounded-[1.6rem] border border-[var(--color-border)] bg-[#faf6ef] p-5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-secondary)] text-xs font-semibold text-white">
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

      <section className="bg-[#f3ece3]">
        <div className="mx-auto w-full max-w-[980px] px-6 py-14 text-center md:px-10">
          <p className="mx-auto max-w-3xl text-base leading-8 text-[var(--color-muted)]">
            Registrá tu local y nos contactamos para ponerlo en marcha.
          </p>
        </div>
      </section>
    </main>
  );
}
