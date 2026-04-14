import Link from "next/link";
import type { Metadata } from "next";

import { ContactForm } from "@/components/public/contact-form";
import { SupportFooter } from "@/components/public/support-footer";
import { SupportHeader } from "@/components/public/support-header";

export const metadata: Metadata = {
  title: "Contacto | Restopickup",
  description: "Contacto comercial y general de Restopickup.",
};

type ContactPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
    ticket?: string;
    source?: string;
  }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const query = await searchParams;

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <SupportHeader />
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 md:px-10 lg:px-12">
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted)]">
            <Link href="/" className="transition hover:text-[var(--color-accent)]">
              Inicio
            </Link>
            <span>/</span>
            <Link href="/soporte" className="transition hover:text-[var(--color-accent)]">
              Soporte
            </Link>
            <span>/</span>
            <span>Contacto</span>
          </div>

          <div className="max-w-4xl py-6 md:py-10">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
              Contacto
            </p>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl">
              Elijamos el mejor canal para ayudarte.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--color-muted)]">
              Si querés sumar tu local, hablar sobre planes o conocer cómo funciona
              Restopickup, entrá por comercial. Si ya operás con la app, podés
              apoyarte primero en soporte.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-14 md:px-10 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-[2rem] border border-[var(--color-border)] bg-white p-8 shadow-[0_20px_60px_rgba(39,24,13,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
              Formulario de contacto
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              Enviános tu consulta y generamos un ticket.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-muted)]">
              El mensaje entra a tu panel admin en la sección Soporte, con número
              de ticket para hacer seguimiento.
            </p>

            <div className="mt-8">
              <ContactForm
                error={query.error}
                success={query.success}
                ticket={query.ticket}
                source={query.source}
              />
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-[var(--color-border)] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Antes de escribirnos
              </p>
              <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--color-muted)]">
                <p>Si ya estás operando con la app, muchas dudas comunes ya están resueltas en soporte.</p>
                <Link
                  href="/soporte"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  Ir al centro de ayuda
                </Link>
              </div>
            </section>

            <section className="rounded-[2rem] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(198,90,46,0.08),rgba(255,255,255,0.96))] p-6">
              <p className="text-lg font-semibold tracking-tight">
                ¿Querés conocer Restopickup para tu local?
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                Si estás evaluando cómo encaja en tu operación, podés pasar por comercial y revisar el producto con más contexto.
              </p>
              <div className="mt-5">
                <Link
                  href="/comercial"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
                >
                  Ir a comercial
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </section>

      <SupportFooter />
    </main>
  );
}
