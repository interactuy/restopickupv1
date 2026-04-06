import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-6 py-16">
      <div className="w-full max-w-2xl rounded-[2rem] border border-[var(--color-border)] bg-white/85 p-10 text-center shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
          No encontrado
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--color-foreground)]">
          No encontramos ese local
        </h1>
        <p className="mt-4 text-base leading-8 text-[var(--color-muted)]">
          Revisá el enlace o volvé al inicio para entrar a un local disponible.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
