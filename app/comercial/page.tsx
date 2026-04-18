import Link from "next/link";
import type { Metadata } from "next";

import { BusinessApplicationForm } from "@/components/public/business-application-form";

export const metadata: Metadata = {
  title: "Comercial | Restopickup",
  description:
    "Conocé cómo Restopickup ayuda a locales gastronómicos a vender online y organizar pedidos para retiro.",
};

type CommercialPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

const operationPoints = [
  "Catálogo con productos, categorías, extras y ofertas",
  "Horarios normales, horarios partidos y cierres puntuales",
  "Pedidos en tiempo real con estados claros para el equipo",
  "Cobros online y seguimiento del retiro",
];

const flow = [
  {
    eyebrow: "1. El cliente compra online",
    title: "Compra sin quedarse atrapado en la fila",
    body: "Explora el menú, elige productos y confirma el pedido en pocos pasos.",
  },
  {
    eyebrow: "2. El local recibe",
    title: "El pedido entra claro y listo para preparar",
    body: "El equipo trabaja con el pago ya resuelto, detalle claro y seguimiento del estado.",
  },
  {
    eyebrow: "3. El cliente retira",
    title: "Retiro más ágil y predecible",
    body: "Pasa cuando corresponde y retira con una experiencia más ordenada.",
  },
];

const faqs = [
  {
    question: "¿Para qué tipo de local sirve mejor?",
    answer:
      "Para locales gastronómicos con retiro por mostrador que quieren ordenar mejor la venta online y la entrega.",
  },
  {
    question: "¿Por qué elegir Restopickup y no otras apps?",
    answer:
      "Porque no toda venta necesita delivery, más comisión y más complejidad. Si tu cliente ya pasa por tu local o te tiene cerca, Restopickup te ayuda a cobrar online, reducir filas y ordenar el retiro sin sumar vueltas innecesarias.",
  },
  {
    question: "¿El cliente paga antes de retirar?",
    answer:
      "Sí. La experiencia está pensada para que el local reciba pedidos con el pago ya resuelto.",
  },
  {
    question: "¿Puedo manejar menú y horarios desde el panel?",
    answer:
      "Sí. El local puede actualizar productos, disponibilidad, horarios, horarios partidos y cierres puntuales desde su dashboard.",
  },
  {
    question: "¿Cuánto me cobran?",
    answer:
      "La forma de cobro se define según las necesidades del local y cómo opera hoy. Lo revisamos contigo para encontrar el esquema que mejor encaje.",
  },
  {
    question: "¿Qué pasa después de registrar el local?",
    answer:
      "Seguimos con la puesta en marcha para dejar el negocio listo para operar con menú, pedidos, horarios y cobros.",
  },
];

function MiniIcon({
  children,
  tone = "accent",
}: {
  children: React.ReactNode;
  tone?: "accent" | "success" | "neutral";
}) {
  const toneClass =
    tone === "success"
      ? "bg-[rgba(47,122,74,0.1)] text-[var(--color-success)]"
      : tone === "neutral"
        ? "bg-[var(--color-surface)] text-[var(--color-foreground)]"
        : "bg-[rgba(198,90,46,0.1)] text-[var(--color-accent)]";

  return (
    <span
      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass}`}
    >
      {children}
    </span>
  );
}

export default async function CommercialPage({
  searchParams,
}: CommercialPageProps) {
  const query = await searchParams;

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto w-full max-w-[1600px] px-6 py-6 md:px-10 lg:px-14">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Restopickup
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#beneficios"
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                Ver beneficios
              </a>
              <a
                href="#registro"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
              >
                Registrá tu local
              </a>
            </div>
          </header>

          <div className="grid gap-14 py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(460px,0.95fr)] lg:items-center lg:py-24">
            <div className="max-w-5xl">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
                Comercial
              </p>
              <h1 className="mt-6 max-w-5xl text-5xl font-semibold tracking-[-0.06em] text-[#21160f] sm:text-6xl lg:text-7xl">
                Vendé online y ordená el retiro para trabajar con más claridad.
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-[var(--color-muted)]">
                Restopickup está pensado para locales gastronómicos que quieren
                recuperar ventas, reducir filas y dar una mejor experiencia desde mostrador.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <a
                  href="#registro"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
                >
                  Registrá tu local
                </a>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  Cómo funciona
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-10 top-8 h-48 w-48 rounded-full bg-[rgba(198,90,46,0.12)] blur-3xl" />
              <div className="absolute -bottom-10 right-0 h-56 w-56 rounded-full bg-[rgba(47,122,74,0.1)] blur-3xl" />

              <div className="relative overflow-hidden rounded-[2.4rem] border border-[rgba(92,59,34,0.14)] bg-[linear-gradient(145deg,#fff9f2_0%,#fff_42%,#f1e4d5_100%)] p-6 shadow-[0_34px_100px_rgba(62,39,20,0.12)]">
                <div className="rounded-[1.8rem] border border-[rgba(92,59,34,0.12)] bg-white p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                        Panel del local
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-[#21160f]">
                        Pedidos claros para el equipo.
                      </p>
                    </div>
                    <span className="rounded-full bg-[rgba(47,122,74,0.1)] px-3 py-1.5 text-xs font-semibold text-[var(--color-success)]">
                      Pago confirmado
                    </span>
                  </div>

                  <div className="mt-6 rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                          Pedido #28
                        </p>
                        <p className="mt-2 text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
                          Listo para preparar
                        </p>
                        <p className="mt-2 text-sm text-[var(--color-muted)]">
                          1 Burger Doble Bacon · 1 Coca Cola zero
                        </p>
                      </div>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        Nuevo
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                        Operación
                      </p>
                      <div className="mt-4 space-y-3 text-sm">
                        <div className="rounded-2xl bg-[var(--color-surface)] px-3 py-2">
                          Menú y categorías
                        </div>
                        <div className="rounded-2xl bg-[rgba(198,90,46,0.1)] px-3 py-2 text-[var(--color-accent)]">
                          Pedidos en tiempo real
                        </div>
                        <div className="rounded-2xl bg-[var(--color-surface)] px-3 py-2">
                          Horarios y disponibilidad
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[rgba(32,22,14,0.08)] bg-[#201813] p-4 text-white">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                        Experiencia del cliente
                      </p>
                      <div className="mt-4 space-y-3">
                        <div className="rounded-2xl border border-white/10 bg-white/6 px-3 py-3">
                          <p className="text-sm font-semibold">Pago online</p>
                          <p className="mt-1 text-sm text-white/70">Retiro estimado: 14 min</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/6 px-3 py-3">
                          <p className="text-sm font-semibold">Seguimiento claro</p>
                          <p className="mt-1 text-sm text-white/70">Recibido · En preparación · Listo</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="beneficios" className="border-b border-[var(--color-border)]">
        <div className="mx-auto w-full max-w-[1600px] px-6 py-20 md:px-10 lg:px-14">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">
              Beneficios
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#21160f]">
              Lo que cambia para el cliente y para el local.
            </h2>
          </div>

          <div className="mt-14 grid gap-16 lg:grid-cols-2">
            <section className="max-w-2xl">
              <div className="flex items-center gap-4">
                <MiniIcon tone="accent">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                    <path d="M7 5.5h10v13H7z" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M10 8.5h4M9 18.5h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </MiniIcon>
                <h3 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
                  Para el cliente
                </h3>
              </div>
              <p className="mt-6 text-lg leading-9 text-[var(--color-muted)]">
                Imaginate que vas llegando justo al trabajo y tu café favorito,
                el que te queda de pasada, tiene una fila larguísima. Sabés que
                no tenés quince o veinte minutos para esperar. Tenés que seguir
                y terminás quedándote sin ese café y sin ese croissant que querías.
              </p>
              <p className="mt-6 text-lg leading-9 text-[var(--color-muted)]">
                Restopickup resuelve exactamente eso: poder pedir antes, pagar
                online y retirar en el momento indicado, evitando la fila y sin
                perder tiempo de más.
              </p>
            </section>

            <section className="max-w-2xl">
              <div className="flex items-center gap-4">
                <MiniIcon tone="success">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                    <path d="M5 10.5h14v8H5z" stroke="currentColor" strokeWidth="1.7" />
                    <path d="m6 10.5 1.2-5h9.6l1.2 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    <path d="M9.5 14h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </MiniIcon>
                <h3 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
                  Para el local
                </h3>
              </div>
              <p className="mt-6 text-lg leading-9 text-[var(--color-muted)]">
                Pensá en esas primeras horas de la mañana o en el almuerzo, cuando
                se junta mucha gente y el equipo no da abasto. Mientras la fila
                crece, también crece la cantidad de personas que miran, ven la
                espera y se van.
              </p>
              <p className="mt-6 text-lg leading-9 text-[var(--color-muted)]">
                Ahí es donde Restopickup hace la diferencia: ayuda a recuperar
                esas ventas, a reducir filas y a trabajar con más tranquilidad,
                porque parte de la demanda ya entra resuelta antes de llegar al mostrador.
              </p>
            </section>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto w-full max-w-[1600px] px-6 py-16 md:px-10 lg:px-14">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">
              Cómo funciona
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#21160f]">
              Un flujo simple para el cliente y más ordenado para el local.
            </h2>
          </div>

          <div className="mt-12 grid gap-0 border-y border-[var(--color-border)] lg:grid-cols-3">
            {flow.map((item, index) => (
              <article
                key={item.title}
                className={`border-b border-[var(--color-border)] py-8 last:border-b-0 lg:border-b-0 lg:px-6 ${
                  index > 0 ? "lg:border-l" : ""
                } ${index === 1 ? "bg-[linear-gradient(135deg,rgba(198,90,46,0.06),rgba(255,255,255,0.96))]" : ""}`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-secondary)]">
                  {item.eyebrow}
                </p>
                <p className="mt-4 text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
                  {item.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto w-full max-w-[1600px] px-6 py-16 md:px-10 lg:px-14">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">
                Lo que podés manejar
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#21160f]">
                Herramientas concretas para vender mejor y operar con más claridad.
              </h2>
            </div>

            <div className="border-l-0 lg:border-l lg:border-[var(--color-border)] lg:pl-12">
              <div className="space-y-4">
                {operationPoints.map((point) => (
                  <div key={point} className="flex items-start gap-4">
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" />
                    <p className="text-base leading-8 text-[var(--color-muted)]">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="registro" className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto w-full max-w-[1600px] px-6 py-16 md:px-10 lg:px-14">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,0.82fr)_minmax(520px,1.18fr)] lg:items-start">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">
                Registro de local
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#21160f]">
                Si te sirve para tu operación, registrá tu local acá mismo.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--color-muted)]">
                Completá los datos principales y seguimos con la puesta en marcha
                para dejar el negocio listo para vender con menú, pedidos y cobros.
              </p>
            </div>

            <div className="rounded-[2.1rem] border border-[var(--color-border)] bg-white p-4 shadow-[0_24px_80px_rgba(39,24,13,0.08)] md:p-6">
              <BusinessApplicationForm error={query.error} success={query.success} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto w-full max-w-[1600px] px-6 py-16 md:px-10 lg:px-14">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">
                Dudas frecuentes
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#21160f]">
                Respuestas claras para decidir si encaja en tu operación.
              </h2>
            </div>

            <div className="border-y border-[var(--color-border)] bg-white">
              {faqs.map((item, index) => (
                <details
                  key={item.question}
                  className={index !== faqs.length - 1 ? "border-b border-[var(--color-border)] group" : "group"}
                  open={index === 0}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-0 py-6 text-left md:px-6">
                    <h3 className="text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
                      {item.question}
                    </h3>
                    <span className="text-2xl leading-none text-[var(--color-muted)] transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="px-0 pb-6 md:px-6">
                    <p className="max-w-3xl text-base leading-8 text-[var(--color-muted)]">
                      {item.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--color-border)] bg-white">
        <div className="mx-auto grid w-full max-w-[1600px] gap-10 px-6 py-10 md:px-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-14">
          <div>
            <p className="text-lg font-semibold tracking-tight">Restopickup</p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
              Venta online y retiro por mostrador para locales gastronómicos que
              quieren operar con más claridad.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#registro"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
            >
              Registrá tu local
            </a>
            <Link
              href="/soporte"
              className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Centro de ayuda
            </Link>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)]">
          <div className="mx-auto grid w-full max-w-[1600px] gap-10 px-6 py-10 md:grid-cols-2 md:px-10 lg:grid-cols-4 lg:px-14">
            <div>
              <p className="text-sm font-semibold tracking-tight text-[var(--color-foreground)]">
                Restopickup
              </p>
              <div className="mt-4 space-y-3 text-sm text-[var(--color-muted)]">
                <Link href="/" className="block transition hover:text-[var(--color-accent)]">
                  Inicio
                </Link>
                <Link href="/comercial" className="block transition hover:text-[var(--color-accent)]">
                  Comercial
                </Link>
                <a href="#registro" className="block transition hover:text-[var(--color-accent)]">
                  Registrá tu local
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold tracking-tight text-[var(--color-foreground)]">
                Soporte
              </p>
              <div className="mt-4 space-y-3 text-sm text-[var(--color-muted)]">
                <Link href="/soporte" className="block transition hover:text-[var(--color-accent)]">
                  Centro de ayuda
                </Link>
                <Link href="/contacto" className="block transition hover:text-[var(--color-accent)]">
                  Contactar soporte
                </Link>
                <Link href="/login" className="block transition hover:text-[var(--color-accent)]">
                  Iniciar sesión
                </Link>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold tracking-tight text-[var(--color-foreground)]">
                Comercial
              </p>
              <div className="mt-4 space-y-3 text-sm text-[var(--color-muted)]">
                <a href="#beneficios" className="block transition hover:text-[var(--color-accent)]">
                  Beneficios
                </a>
                <a href="#como-funciona" className="block transition hover:text-[var(--color-accent)]">
                  Cómo funciona
                </a>
                <a href="#registro" className="block transition hover:text-[var(--color-accent)]">
                  Registro de local
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold tracking-tight text-[var(--color-foreground)]">
                Navegación
              </p>
              <div className="mt-4 space-y-3 text-sm text-[var(--color-muted)]">
                <Link href="/solicitar-acceso" className="block transition hover:text-[var(--color-accent)]">
                  Página de registro
                </Link>
                <Link href="/soporte" className="block transition hover:text-[var(--color-accent)]">
                  Ayuda
                </Link>
                <Link href="/" className="block transition hover:text-[var(--color-accent)]">
                  Volver a la home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
