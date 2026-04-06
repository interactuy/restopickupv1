import Link from "next/link";
import { redirect } from "next/navigation";

import { completeDashboardOnboardingAction } from "@/lib/dashboard/actions";
import {
  getDashboardOnboardingItems,
  requireDashboardContext,
} from "@/lib/dashboard/server";

import { SubmitButton } from "@/components/dashboard/submit-button";

export default async function DashboardOnboardingPage() {
  const context = await requireDashboardContext();

  if (context.business.onboardingCompletedAt) {
    redirect("/dashboard");
  }

  const items = await getDashboardOnboardingItems(context);
  const completedItems = items.filter((item) => item.done).length;

  return (
    <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
        Onboarding
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--color-foreground)]">
        Bienvenido a Restopickup
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
        Este panel te va a servir para recibir pedidos, mantener tu menú
        actualizado y dejar lista la experiencia de retiro de tu local. Antes de
        empezar, repasá estos pasos sugeridos para dejar tu tienda en condiciones.
      </p>

      <div className="mt-8 rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <p className="text-sm font-medium text-[var(--color-muted)]">
          Avance inicial
        </p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-[var(--color-foreground)]">
          {completedItems}/{items.length}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
          No hace falta completar todo ahora mismo, pero este checklist te ayuda a
          entender el orden recomendado para empezar a operar.
        </p>
      </div>

      <div className="mt-8 grid gap-4">
        {items.map((item, index) => (
          <article
            key={item.id}
            className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                  Paso {index + 1}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--color-foreground)]">
                  {item.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
                  {item.description}
                </p>
              </div>

              <div className="flex flex-col items-end gap-3">
                <span
                  className={
                    item.done
                      ? "inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700"
                      : "inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700"
                  }
                >
                  {item.done ? "Listo" : "Pendiente"}
                </span>
                <Link
                  href={item.href}
                  className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  Ir a este paso
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-[1.75rem] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(203,98,57,0.08),rgba(255,255,255,0.9))] p-6">
        <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
          Qué pasa cuando empiecen a entrar pedidos
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          Los pedidos que hagan tus clientes desde la tienda pública van a aparecer
          en el dashboard. Desde ahí vas a poder cambiar su estado, marcar cuándo
          están listos para retirar y mantener tu catálogo disponible en tiempo real.
        </p>

        <form action={completeDashboardOnboardingAction} className="mt-6">
          <SubmitButton
            label="Entendido, empezar configuración"
            pendingLabel="Preparando panel..."
          />
        </form>
      </div>
    </section>
  );
}
