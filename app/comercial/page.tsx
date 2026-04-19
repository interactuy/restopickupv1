import Link from "next/link";
import type { Metadata } from "next";

import { BusinessApplicationForm } from "@/components/public/business-application-form";

export const metadata: Metadata = {
  title: "Comercial | Restopickup",
  description:
    "Restopickup ayuda a locales gastronómicos a vender online con retiro en mostrador, reducir filas y ordenar la operación.",
};

type CommercialPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

const heroBullets = [
  "Captá pedidos incluso cuando el local está lleno",
  "Pago confirmado antes de preparar",
  "Retiro rápido para clientes que no pueden esperar",
];

const quickWins = [
  {
    title: "Menos fila",
    body: "Evitá saturar el mostrador en hora pico",
  },
  {
    title: "Más pedidos",
    body: "Captá demanda aunque el local esté lleno",
  },
  {
    title: "Cobro resuelto",
    body: "Recibí pedidos ya confirmados",
  },
  {
    title: "Retiro claro",
    body: "El cliente sabe cuándo pasar",
  },
];

const painBullets = [
  "Fila que espanta ventas",
  "Cobro y toma de pedido al mismo tiempo",
  "Clientes con poco tiempo que se van",
];

const flowSteps = [
  {
    step: "Paso 1",
    title: "El cliente pide antes de llegar",
    body: "Hace el pedido con tiempo y evita perder minutos en la fila.",
    visual: ["Burger clásica", "Wrap Caesar", "Confirmar pedido"],
  },
  {
    step: "Paso 2",
    title: "Paga online",
    body: "El pedido entra ya confirmado y listo para trabajar.",
    visual: ["Pago aprobado", "Tarjeta terminada en 2145"],
  },
  {
    step: "Paso 3",
    title: "El local prepara con claridad",
    body: "El equipo recibe qué hacer, cuándo entregar y con el cobro resuelto.",
    visual: ["Pedido #28", "En preparación"],
  },
  {
    step: "Paso 4",
    title: "Retira sin fricción",
    body: "El cliente pasa cuando está pronto y retira sin sumar más espera.",
    visual: ["Listo para retirar", "Cliente en camino"],
  },
];

const benefits = [
  {
    title: "Más pedidos sin sumar delivery",
    body: "Captá ventas de gente que hoy no entra a la fila.",
  },
  {
    title: "Menos carga en mostrador",
    body: "Descargá parte de la presión justo cuando el local se llena.",
  },
  {
    title: "Pago antes de preparar",
    body: "Evitá pérdidas y prepará con el pedido ya confirmado.",
  },
  {
    title: "Pedidos más claros",
    body: "El equipo sabe qué preparar, en qué estado está y cuándo entregar.",
  },
  {
    title: "Mejor experiencia para el cliente",
    body: "Ideal para clientes con poco tiempo en la mañana o al almuerzo.",
  },
  {
    title: "Operación más prolija",
    body: "Más orden en horas pico sin depender de delivery.",
  },
];

const dashboardCapabilities = [
  {
    title: "Catálogo y productos",
    body: "Actualizá menú, precios y disponibilidad según el momento del día.",
  },
  {
    title: "Horarios y retiro",
    body: "Definí cuándo tomar pedidos y cuándo retirarlos sin improvisar.",
  },
  {
    title: "Pedidos en tiempo real",
    body: "Seguí cada pedido sin depender de mensajes ni coordinación manual.",
  },
  {
    title: "Cobros online",
    body: "Recibí pedidos confirmados antes de empezar a prepararlos.",
  },
  {
    title: "Estados y seguimiento",
    body: "Marcá cada pedido y ordená el retiro cuando más movimiento hay.",
  },
];

const localTypes = [
  "Cafeterías",
  "Hamburgueserías",
  "Pizzerías",
  "Locales de almuerzo",
  "Panaderías",
  "Comida rápida",
  "Take away",
  "Cocinas con retiro",
];

const faqs = [
  {
    question: "¿Sirve para cualquier tipo de local?",
    answer:
      "Funciona mejor en cafés, locales de almuerzo, panaderías, take away y negocios con retiro por mostrador que tienen horas pico marcadas.",
  },
  {
    question: "¿Reemplaza al delivery?",
    answer:
      "No. Está pensado para resolver mejor el retiro por mostrador. La fortaleza de Restopickup es captar pedidos anticipados para clientes que quieren pasar y retirar rápido.",
  },
  {
    question: "¿Cómo se cobra?",
    answer:
      "Trabajamos con un esquema simple y entendible según cómo opera tu local. La idea es que tenga sentido para tu negocio y para el tipo de demanda que querés captar.",
  },
  {
    question: "¿Qué necesito para empezar?",
    answer:
      "Con dejar los datos básicos ya alcanza para la primera conversación. Después revisamos juntos menú, horarios, cobros y cómo encajaría en tu operación.",
  },
  {
    question: "¿Cuánto demora activarlo?",
    answer:
      "Depende del tipo de local y de qué tan pronto quieras salir a probarlo, pero la puesta en marcha está pensada para ser simple y acompañada.",
  },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
      {children}
    </p>
  );
}

export default async function CommercialPage({
  searchParams,
}: CommercialPageProps) {
  const query = await searchParams;

  return (
    <main className="min-h-screen bg-[#f5f0e8] text-[#1f1711]">
      <section className="border-b border-[rgba(54,35,22,0.12)] bg-[linear-gradient(180deg,#f2ece3_0%,#f7f3ec_100%)]">
        <div className="mx-auto w-full max-w-[1580px] px-6 py-5 md:px-10 lg:px-14">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="text-lg font-semibold tracking-tight text-[#1f1711]">
              Restopickup
            </Link>

            <nav className="hidden items-center gap-8 text-sm text-[rgba(31,23,17,0.68)] md:flex">
              <a href="#como-funciona" className="transition hover:text-[#1f1711]">
                Cómo funciona
              </a>
              <a href="#beneficios" className="transition hover:text-[#1f1711]">
                Para locales
              </a>
              <Link href="/contacto" className="transition hover:text-[#1f1711]">
                Contacto
              </Link>
            </nav>

            <a
              href="#registro"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
            >
              Registrar mi local
            </a>
          </header>

          <div className="grid min-h-[78vh] gap-16 py-14 lg:grid-cols-[minmax(0,0.96fr)_minmax(420px,0.84fr)] lg:items-center lg:py-20">
            <div className="max-w-4xl">
              <Eyebrow>Pedidos anticipados para retiro por mostrador</Eyebrow>
              <h1 className="mt-7 max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-[#1f1711] sm:text-6xl lg:text-[5.3rem] lg:leading-[0.95]">
                Que la fila no te haga perder ventas.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[rgba(31,23,17,0.74)]">
                Pedidos online, pago resuelto y retiro ordenado para locales gastronómicos
                con horas pico fuertes y clientes que no pueden esperar.
              </p>

              <div className="mt-10 space-y-4">
                {heroBullets.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#1f1711]" />
                    <p className="text-base leading-7 text-[#1f1711]">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href="#registro"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
                >
                  Registrar mi local
                </a>
                <a
                  href="#como-funciona"
                  className="text-sm font-semibold text-[#1f1711] underline decoration-[rgba(31,23,17,0.2)] underline-offset-4 transition hover:text-[var(--color-accent)] hover:decoration-[var(--color-accent)]"
                >
                  Ver cómo funciona
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-[2rem] border border-[rgba(54,35,22,0.14)] bg-white p-5 shadow-[0_24px_70px_rgba(56,35,21,0.08)]">
                <div className="border-b border-[rgba(54,35,22,0.1)] pb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                    Pedidos en tiempo real
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-[#1f1711]">
                    Pedido #28
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[rgba(31,23,17,0.7)]">
                    2 cheeseburgers, 1 papas, 1 coca
                  </p>
                </div>

                <div className="space-y-4 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-[rgba(31,23,17,0.72)]">Estado</span>
                    <span className="rounded-full bg-[rgba(47,122,74,0.1)] px-3 py-1 text-sm font-semibold text-[var(--color-success)]">
                      Pago confirmado
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-[rgba(31,23,17,0.72)]">Retiro estimado</span>
                    <span className="text-sm font-semibold text-[#1f1711]">14 min</span>
                  </div>
                </div>

                <div className="border-t border-[rgba(54,35,22,0.1)] pt-4">
                  <div className="flex items-center gap-3 text-sm text-[rgba(31,23,17,0.72)]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-success)]" />
                    Pedido visible para el equipo y listo para trabajar
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-4 rounded-2xl border border-[rgba(54,35,22,0.12)] bg-white px-4 py-3 shadow-[0_16px_40px_rgba(56,35,21,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(31,23,17,0.48)]">
                  Estado
                </p>
                <p className="mt-2 text-sm font-semibold text-[#1f1711]">Pago aprobado</p>
              </div>

              <div className="absolute -right-3 top-12 rounded-2xl border border-[rgba(54,35,22,0.12)] bg-white px-4 py-3 shadow-[0_16px_40px_rgba(56,35,21,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(31,23,17,0.48)]">
                  Operación
                </p>
                <p className="mt-2 text-sm font-semibold text-[#1f1711]">Listo para preparar</p>
              </div>

              <div className="absolute bottom-16 right-6 rounded-2xl border border-[rgba(54,35,22,0.12)] bg-white px-4 py-3 shadow-[0_16px_40px_rgba(56,35,21,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(31,23,17,0.48)]">
                  Cliente
                </p>
                <p className="mt-2 text-sm font-semibold text-[#1f1711]">En camino</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(54,35,22,0.12)] bg-[#ece4d8]">
        <div className="mx-auto grid w-full max-w-[1580px] gap-0 px-6 py-8 md:px-10 lg:grid-cols-4 lg:px-14">
          {quickWins.map((item, index) => (
            <article
              key={item.title}
              className={`py-4 lg:px-6 ${index > 0 ? "lg:border-l lg:border-[rgba(54,35,22,0.12)]" : ""}`}
            >
              <p className="text-lg font-semibold tracking-tight text-[#1f1711]">{item.title}</p>
              <p className="mt-2 text-sm leading-7 text-[rgba(31,23,17,0.7)]">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-b border-[rgba(54,35,22,0.12)] bg-white">
        <div className="mx-auto grid w-full max-w-[1580px] gap-16 px-6 py-20 md:px-10 lg:grid-cols-[minmax(420px,0.95fr)_minmax(0,1.05fr)] lg:px-14 lg:items-center">
          <div className="relative min-h-[360px]">
            <div className="absolute left-0 top-0 w-[70%] rounded-[1.8rem] border border-[rgba(54,35,22,0.12)] bg-[#f7f3ec] p-4 shadow-[0_14px_32px_rgba(56,35,21,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(31,23,17,0.46)]">
                WhatsApp
              </p>
              <p className="mt-3 text-sm leading-7 text-[#1f1711]">
                “Hola, me guardás 2 cafés y 3 medialunas? Paso en 15”
              </p>
            </div>

            <div className="absolute right-0 top-12 w-[60%] rounded-[1.5rem] border border-[rgba(54,35,22,0.12)] bg-white p-4 shadow-[0_14px_32px_rgba(56,35,21,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(31,23,17,0.46)]">
                Esperando respuesta
              </p>
              <p className="mt-3 text-sm font-semibold text-[#1f1711]">Cobro pendiente</p>
            </div>

            <div className="absolute bottom-14 left-10 w-[64%] rounded-[1.7rem] border border-[rgba(54,35,22,0.12)] bg-white p-4 shadow-[0_14px_32px_rgba(56,35,21,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(31,23,17,0.46)]">
                Lista manual
              </p>
              <div className="mt-3 space-y-2 text-sm text-[rgba(31,23,17,0.72)]">
                <p>- café chico</p>
                <p>- medialunas x3</p>
                <p>- confirmar pago</p>
              </div>
            </div>

            <div className="absolute bottom-0 right-10 rounded-full bg-[#8b3f2b] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(56,35,21,0.14)]">
              Fila en mostrador
            </div>
          </div>

          <div className="max-w-3xl">
              <Eyebrow>El problema real</Eyebrow>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#1f1711]">
                Cuando los pedidos entran por todos lados, el mostrador se tranca.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[rgba(31,23,17,0.72)]">
                El cliente espera, el equipo se sobrecarga y parte de la demanda se
                pierde. Hay gente que quiere comprar, pero no puede quedarse 10 o 15
                minutos haciendo fila.
              </p>

            <div className="mt-8 space-y-3">
              {painBullets.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#8b3f2b]" />
                  <p className="text-base leading-7 text-[#1f1711]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-b border-[rgba(54,35,22,0.12)] bg-[#f8f4ed]">
        <div className="mx-auto w-full max-w-[1580px] px-6 py-20 md:px-10 lg:px-14">
          <div className="max-w-3xl">
            <Eyebrow>La solución</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#1f1711]">
              Un flujo simple para captar pedidos anticipados y entregar mejor.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-4">
            {flowSteps.map((item) => (
              <article
                key={item.title}
                className="rounded-[1.8rem] border border-[rgba(54,35,22,0.12)] bg-white p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-secondary)]">
                  {item.step}
                </p>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[#1f1711]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[rgba(31,23,17,0.72)]">
                  {item.body}
                </p>

                <div className="mt-6 space-y-2 rounded-[1.4rem] bg-[#f5f0e8] p-4">
                  {item.visual.map((line) => (
                    <div
                      key={line}
                      className="rounded-2xl border border-[rgba(54,35,22,0.1)] bg-white px-3 py-2 text-sm text-[#1f1711]"
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="beneficios" className="border-b border-[rgba(54,35,22,0.12)] bg-white">
        <div className="mx-auto w-full max-w-[1580px] px-6 py-20 md:px-10 lg:px-14">
          <div className="max-w-3xl">
            <Eyebrow>Beneficios para el local</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#1f1711]">
              Lo que gana el local cuando una parte de la demanda entra antes de llegar al mostrador.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {benefits.map((item) => (
              <article
                key={item.title}
                className="rounded-[1.6rem] border border-[rgba(54,35,22,0.12)] bg-[#faf7f1] p-6"
              >
                <p className="text-xl font-semibold tracking-tight text-[#1f1711]">{item.title}</p>
                <p className="mt-3 text-sm leading-7 text-[rgba(31,23,17,0.72)]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(54,35,22,0.12)] bg-[#2c2621] text-white">
        <div className="mx-auto grid w-full max-w-[1580px] gap-14 px-6 py-20 md:px-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:px-14 lg:items-start">
          <div>
            <Eyebrow>Producto real</Eyebrow>
            <div className="mt-5 rounded-[2rem] border border-white/10 bg-[#1f1a16] p-5">
              <div className="grid gap-4 border-b border-white/10 pb-5 md:grid-cols-[minmax(0,1fr)_220px]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
                    Pedidos del día
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-sm font-semibold">#28 · Nuevo</p>
                      <p className="mt-1 text-sm text-white/70">2 cheeseburgers · retiro 14 min</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-sm font-semibold">#27 · En preparación</p>
                      <p className="mt-1 text-sm text-white/70">1 pizza napolitana · retiro 8 min</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-sm font-semibold">#26 · Listo</p>
                      <p className="mt-1 text-sm text-white/70">2 wraps Caesar · cliente en camino</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
                    Resumen
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-sm text-white/70">Pedidos activos</p>
                      <p className="mt-2 text-2xl font-semibold">12</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-sm text-white/70">Cobro resuelto</p>
                      <p className="mt-2 text-2xl font-semibold">92%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  Nuevo
                </div>
                <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  En preparación
                </div>
                <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  Listo
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-xl">
            <h2 className="text-4xl font-semibold tracking-tight text-white">
              Un panel pensado para horas pico reales, no para verse bien en una demo.
            </h2>

            <div className="mt-8 space-y-6">
              {dashboardCapabilities.map((item) => (
                <div key={item.title} className="border-b border-white/10 pb-6">
                  <p className="text-lg font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-white/70">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(54,35,22,0.12)] bg-white">
        <div className="mx-auto w-full max-w-[1580px] px-6 py-20 md:px-10 lg:px-14">
          <div className="max-w-3xl">
            <Eyebrow>La diferencia</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#1f1711]">
              No es lo mismo seguir dependiendo de la fila que captar pedidos antes de que el cliente llegue.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <article className="rounded-[1.8rem] border border-[rgba(54,35,22,0.12)] bg-[#f1ece4] p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(31,23,17,0.48)]">
                Como hoy
              </p>
              <h3 className="mt-4 text-3xl font-semibold tracking-tight text-[#1f1711]">
                Seguir resolviéndolo como hoy
              </h3>
              <div className="mt-6 space-y-3">
                {[
                  "Pedidos por WhatsApp",
                  "Cobro manual",
                  "Fila en caja",
                  "Preparación desordenada",
                  "Clientes preguntando si ya está",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.2rem] border border-[rgba(54,35,22,0.08)] bg-white/70 px-4 py-3 text-sm text-[rgba(31,23,17,0.72)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[1.8rem] border border-[rgba(54,35,22,0.12)] bg-[#fbf8f3] p-8 shadow-[0_18px_40px_rgba(56,35,21,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                Con Restopickup
              </p>
              <h3 className="mt-4 text-3xl font-semibold tracking-tight text-[#1f1711]">
                Con un flujo de retiro más claro
              </h3>
              <div className="mt-6 space-y-3">
                {[
                  "Pedido online",
                  "Pago confirmado",
                  "Tiempos definidos",
                  "Estados visibles",
                  "Retiro más ordenado",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.2rem] border border-[rgba(54,35,22,0.08)] bg-white px-4 py-3 text-sm font-medium text-[#1f1711]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(54,35,22,0.12)] bg-[#f7f2ea]">
        <div className="mx-auto w-full max-w-[1580px] px-6 py-16 md:px-10 lg:px-14">
          <div className="max-w-3xl">
            <Eyebrow>Dónde encaja mejor</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#1f1711]">
              Pensado para locales con alto movimiento en mostrador y poco margen para hacer esperar.
            </h2>
            <p className="mt-5 text-base leading-8 text-[rgba(31,23,17,0.72)]">
              Ideal para cafés, almuerzos y negocios con alto tráfico en zonas de oficinas, shoppings y puntos gastronómicos.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {localTypes.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[rgba(54,35,22,0.12)] bg-white px-5 py-3 text-sm font-medium text-[#1f1711]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="registro" className="border-b border-[rgba(54,35,22,0.12)] bg-white">
        <div className="mx-auto w-full max-w-[1280px] px-6 py-20 md:px-10">
          <div className="rounded-[2rem] border border-[rgba(54,35,22,0.12)] bg-[#faf6ef] p-8 md:p-10">
            <div className="mx-auto max-w-2xl text-center">
              <Eyebrow>Activación comercial</Eyebrow>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#1f1711]">
                Contanos sobre tu local
              </h2>
              <p className="mt-4 text-base leading-8 text-[rgba(31,23,17,0.72)]">
                Te contactamos para mostrarte cómo funcionaría en tu operación y si encaja bien con tus horas pico.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-3xl">
              <BusinessApplicationForm
                error={query.error}
                success={query.success}
                mode="commercial"
                redirectPath="/comercial"
              />
              <p className="mt-4 text-center text-sm text-[rgba(31,23,17,0.62)]">
                Respuesta comercial simple, sin compromiso.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(54,35,22,0.12)] bg-white">
        <div className="mx-auto w-full max-w-[1180px] px-6 py-18 md:px-10 md:py-20">
          <div className="max-w-2xl">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#1f1711]">
              Lo que suele frenar la decisión, respondido sin vueltas.
            </h2>
          </div>

          <div className="mt-12 border-y border-[rgba(54,35,22,0.12)]">
            {faqs.map((item, index) => (
              <details
                key={item.question}
                open={index === 0}
                className={index !== faqs.length - 1 ? "group border-b border-[rgba(54,35,22,0.12)]" : "group"}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left">
                  <h3 className="text-xl font-semibold tracking-tight text-[#1f1711]">
                    {item.question}
                  </h3>
                  <span className="text-2xl leading-none text-[rgba(31,23,17,0.58)] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="pb-6">
                  <p className="max-w-3xl text-base leading-8 text-[rgba(31,23,17,0.72)]">
                    {item.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f3ece3]">
        <div className="mx-auto w-full max-w-[1180px] px-6 py-20 text-center md:px-10">
          <h2 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-[#1f1711] md:text-5xl">
            Menos tiempo perdido para el cliente. Menos ventas perdidas para el local.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[rgba(31,23,17,0.72)]">
            Si tu local se satura en hora pico, Restopickup puede ayudarte a captar pedidos anticipados y ordenar mejor el retiro.
          </p>
          <div className="mt-8">
            <a
              href="#registro"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
            >
              Registrar mi local
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[rgba(54,35,22,0.12)] bg-white">
        <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-[rgba(31,23,17,0.62)] md:px-10">
          <span className="font-semibold text-[#1f1711]">Restopickup</span>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/contacto" className="transition hover:text-[#1f1711]">
              Contacto
            </Link>
            <Link href="/soporte" className="transition hover:text-[#1f1711]">
              Soporte
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
