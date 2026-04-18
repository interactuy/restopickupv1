import Link from "next/link";

type SupportHeaderProps = {
  compact?: boolean;
};

export function SupportHeader({ compact = false }: SupportHeaderProps) {
  return (
    <header
      className={`border-b border-[var(--color-border)] bg-white/88 backdrop-blur-sm ${
        compact ? "" : "sticky top-0 z-30"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-10 lg:px-12">
        <Link href="/soporte" className="flex items-center gap-3">
          <div>
            <span className="block text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
              Restopickup
            </span>
            <span className="block text-sm font-medium text-[var(--color-muted)]">
              Soporte
            </span>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center rounded-2xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)]"
          >
            Contactar soporte
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl bg-[var(--color-foreground)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </header>
  );
}
