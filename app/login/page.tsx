import Link from "next/link";
import { redirect } from "next/navigation";

import { loginAction } from "@/lib/dashboard/actions";
import { getDashboardContext } from "@/lib/dashboard/server";

import { SubmitButton } from "@/components/dashboard/submit-button";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    redirectTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const context = await getDashboardContext();
  const { redirectTo, error } = await searchParams;
  const safeRedirectTo =
    redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : "/dashboard";

  if (context) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-6 py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
          Acceso local
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
          Ingresá al dashboard
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
          Solo usuarios asociados a un local pueden entrar a la parte operativa.
        </p>

        <form action={loginAction} className="mt-8 space-y-5">
          <input type="hidden" name="redirectTo" value={safeRedirectTo} />

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
            />
          </div>

          {error === "invalid-credentials" ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              No pudimos iniciar sesión. Revisá email y contraseña.
            </div>
          ) : null}

          <SubmitButton label="Ingresar" pendingLabel="Ingresando..." />
        </form>

        <div className="mt-6">
          <Link
            href="/"
            className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
