import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comercial | Restopickup",
  description:
    "Conocé cómo Restopickup ayuda a locales gastronómicos a vender online y organizar pedidos para retiro.",
};

const valuePoints = [
  {
    label: "Pedidos pagos",
    description: "El cliente paga online y el local recibe el pedido listo para preparar.",
  },
  {
    label: "Retiro ordenado",
    description: "Menos filas, menos mensajes cruzados y mejor ritmo en horas pico.",
  },
  {
    label: "Operación simple",
    description: "Menú, horarios, pedidos y pagos desde un panel claro para el equipo.",
  },
];

const flowSteps = [
  {
    step: "1",
    title: "Tu local publica el menú",
    body: "Cargás productos, horarios y punto de retiro desde el dashboard.",
  },
  {
    step: "2",
    title: "El cliente elige y paga",
    body: "Compra online y recibe confirmación con horario estimado de retiro.",
  },
  {
    step: "3",
    title: "El equipo prepara",
    body: "El pedido entra al panel listo para operar, sin validaciones manuales de cobro.",
  },
  {
    step: "4",
    title: "Retiro más ágil",
    body: "El cliente llega con el pedido ya encaminado y retira sin esperar de más.",
  },
];

const featureRows = [
  {
    title: "Menú y catálogo",
    body: "Productos, categorías, extras, ofertas e imágenes en una sola estructura.",
  },
  {
    title: "Pedidos en tiempo real",
    body: "Nuevos pedidos, preparación, retiro y seguimiento del estado operativo.",
  },
  {
    title: "Pagos online",
    body: "Cobro online con Mercado Pago y confirmación directa para el local.",
  },
  {
    title: "Cuenta del cliente",
    body: "Favoritos, compras anteriores y recompra rápida para volver a pedir sin vueltas.",
  },
  {
    title: "Vista para el equipo",
    body: "Panel pensado para mostrador, cocina o administración, con una operación más clara.",
  },
  {
    title: "Soporte y puesta en marcha",
    body: "Registro del local, acompañamiento inicial y ayuda para dejar todo bien configurado.",
  },
];

const businessTypes = [
  "Cafeterías",
  "Pizzerías",
  "Burgers",
  "Pastas",
  "Ensaladas y wraps",
  "Pastelería y dulces",
];

export default function CommercialPage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col px-6 py-6 md:px-10 lg:px-14">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Restopickup
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                Hablar con ventas
              </Link>
              <Link
                href="/solicitar-acceso"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
              >
                Registrá tu local
              </Link>
            </div>
          </header>

          <div className="grid gap-10 py-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] lg:items-end lg:py-20">
            <div className="max-w-5xl">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
                Comercial
              </p>
              <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-[#21160f] sm:text-6xl lg:text-7xl">
                Vendé online y organizá el retiro sin sumar fricción al local.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--color-muted)]">
                Restopickup ayuda a locales gastronómicos a recibir pedidos pagos,
                prepararlos con más claridad y entregar mejor en mostrador.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/solicitar-acceso"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
                >
                  Registrá tu local
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  Ver cómo funciona
                </a>
              </div>
            </div>

            <div className="border-l border-[var(--color-border)] pl-0 lg:pl-10">
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-secondary)]">
                    Ideal para
                  </p>
                  <p className="mt-3 text-base leading-8 text-[var(--color-muted)]">
                    Locales con retiro por mostrador, venta digital creciente o
                    necesidad de ordenar la demanda en momentos de más movimiento.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {businessTypes.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm text-[var(--color-foreground)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto grid w-full max-w-[1600px] gap-6 px-6 py-10 md:px-10 lg:grid-cols-3 lg:px-14">
          {valuePoints.map((item) => (
            <article key={item.label} className="border-l border-[var(--color-border)] pl-5">
              <p className="text-sm font-semibold tracking-tight text-[var(--color-foreground)]">
                {item.label}
              </p>
              <p className="mt-3 max-w-md text-sm leading-7 text-[var(--color-muted)]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="border-b border-[var(--color-border)]">
        <div className="mx-auto grid w-full max-w-[1600px] gap-10 px-6 py-14 md:px-10 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-14">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">
              Cómo funciona
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#21160f]">
              Un flujo simple para el cliente y ordenado para el local.
            </h2>
          </div>

          <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {flowSteps.map((item) => (
              <div
                key={item.step}
                className="grid gap-4 py-6 md:grid-cols-[80px_minmax(0,1fr)] md:items-start"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-secondary)]">
                  Paso {item.step}
                </p>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto w-full max-w-[1600px] px-6 py-14 md:px-10 lg:px-14">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">
              Qué incluye
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#21160f]">
              Herramientas concretas para vender mejor y operar con más claridad.
            </h2>
          </div>

          <div className="mt-10 grid border-y border-[var(--color-border)] md:grid-cols-2 xl:grid-cols-3">
            {featureRows.map((item, index) => (
              <article
                key={item.title}
                className={`px-0 py-6 md:px-6 ${
                  index % 3 !== 0 ? "xl:border-l xl:border-[var(--color-border)]" : ""
                } ${index % 2 !== 0 ? "md:border-l md:border-[var(--color-border)] xl:border-l-0" : ""}`}
              >
                <h3 className="text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-7 text-[var(--color-muted)]">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(135deg,#F7F4EF_0%,#FFFDFC_100%)]">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-6 py-16 md:px-10 lg:px-14">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">
              Empezá con tu local
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#21160f] sm:text-5xl">
              Si te sirve para tu operación, demos el siguiente paso.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--color-muted)]">
              Podés registrar tu local o hablar con el equipo para revisar cómo
              encaja Restopickup en tu forma de vender y entregar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/solicitar-acceso"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
            >
              Registrá tu local
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Hablar con ventas
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
