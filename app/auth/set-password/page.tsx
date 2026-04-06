import Link from "next/link";

import { SetPasswordForm } from "@/components/auth/set-password-form";

export default function SetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-6 py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
          Primer acceso
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
          Definí tu contraseña
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
          Este paso deja listo el acceso inicial al dashboard de tu local. Después
          vas a entrar normalmente desde login.
        </p>

        <div className="mt-8">
          <SetPasswordForm />
        </div>

        <div className="mt-6">
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]"
          >
            Volver al login
          </Link>
        </div>
      </div>
    </main>
  );
}
