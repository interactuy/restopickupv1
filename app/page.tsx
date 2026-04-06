import Link from "next/link";

import { EmptyState } from "@/components/public/empty-state";
import { getFeaturedBusiness } from "@/lib/supabase/public";

export default async function Home() {
  const featuredBusiness = await getFeaturedBusiness();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)]">
      <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,_rgba(198,122,48,0.24),_transparent_62%)]" />
      <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-[rgba(137,93,53,0.08)] blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-8 md:px-10 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Restopickup
          </Link>
          <div className="rounded-full border border-[var(--color-border)] bg-white/75 px-4 py-2 text-sm text-[var(--color-muted)] backdrop-blur-sm">
            Pedidos para retirar, sin vueltas
          </div>
        </header>

        <section className="grid gap-10 pb-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
              App web para locales gastronomicos
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl">
              Menus online pensados para pedir y retirar en el local.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-muted)]">
              Restopickup conecta el catalogo real del negocio con una
              experiencia publica simple, veloz y moderna. Sin mock data: lo que
              ves se lee directo desde Supabase.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              {featuredBusiness ? (
                <Link
                  href={`/locales/${featuredBusiness.slug}`}
                  className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95"
                >
                  Ver {featuredBusiness.name}
                </Link>
              ) : null}
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white/80 px-6 py-3 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                Como funciona
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--color-border)] bg-white/80 p-7 shadow-[0_28px_90px_rgba(39,24,13,0.08)] backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
              Local destacado
            </p>
            {featuredBusiness ? (
              <>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                  {featuredBusiness.name}
                </h2>
                <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
                  {featuredBusiness.pickupAddress}
                </p>
                {featuredBusiness.pickupInstructions ? (
                  <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                    {featuredBusiness.pickupInstructions}
                  </p>
                ) : null}
                <div className="mt-6">
                  <Link
                    href={`/locales/${featuredBusiness.slug}`}
                    className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    Entrar al menu
                  </Link>
                </div>
              </>
            ) : (
              <div className="mt-4">
                <EmptyState
                  eyebrow="Sin locales"
                  title="Todavia no hay un negocio activo para mostrar"
                  description="Aplicando el seed de Supabase vas a ver aca el primer local activo listo para navegar."
                />
              </div>
            )}
          </div>
        </section>

        <section id="como-funciona" className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Catalogo real",
              description:
                "La home y cada menu publico consultan datos reales del negocio en Supabase.",
            },
            {
              title: "Retiro en local",
              description:
                "El foco esta puesto en una operacion simple: elegir, pedir y pasar a buscar.",
            },
            {
              title: "Base lista para crecer",
              description:
                "La UI ya queda preparada para sumar carrito, checkout invitado y pagos despues.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-[1.75rem] border border-[var(--color-border)] bg-white/80 p-6 shadow-[0_20px_60px_rgba(39,24,13,0.06)]"
            >
              <h2 className="text-xl font-semibold tracking-tight">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                {item.description}
              </p>
            </article>
          ))}
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--color-border)] pt-6">
          <p className="text-sm text-[var(--color-muted)]">
            Restopickup para locales que quieren vender online sin enredar la operación.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Link
              href="/solicitar-acceso"
              className="text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
            >
              ¿Tenés un local? Solicitar acceso
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
