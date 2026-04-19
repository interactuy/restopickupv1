import Link from "next/link";

export function SupportFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-white/75">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm md:px-10 lg:px-12">
        <p className="text-[var(--color-muted)]">
          Restopickup Soporte para locales que quieren operar claro, rápido y sin fricción.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/comercial"
            className="text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
          >
            Comercial
          </Link>
          <Link
            href="/soporte"
            className="text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
          >
            Centro de ayuda
          </Link>
          <Link
            href="/contacto"
            className="text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
          >
            Contacto
          </Link>
          <Link
            href="/registrar-local"
            className="text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
          >
            Registrá tu local
          </Link>
        </div>
      </div>
    </footer>
  );
}
