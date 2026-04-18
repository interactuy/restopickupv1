import Link from "next/link";
import type { CSSProperties } from "react";
import {
  BarChart3,
  ClipboardList,
  CreditCard,
  Gauge,
  LayoutGrid,
  Package2,
  Settings2,
  Sparkles,
} from "lucide-react";

import { DashboardLiveNotifier } from "@/components/dashboard/dashboard-live-notifier";
import { SubmitButton } from "@/components/dashboard/submit-button";
import {
  lockAdminModeAction,
  logoutAction,
  toggleBusinessTemporaryClosedAction,
} from "@/lib/dashboard/actions";
import {
  getDashboardOverview,
  requireDashboardContext,
} from "@/lib/dashboard/server";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const context = await requireDashboardContext();
  const showAdminLinks =
    context.membership.isAdminRole && context.isAdminModeEnabled;
  const overview = context.business.onboardingCompletedAt
    ? await getDashboardOverview(context.business.id)
    : null;
  const links = context.business.onboardingCompletedAt && showAdminLinks
    ? [
        { href: "/dashboard", label: "Resumen", icon: Gauge },
        {
          href: "/dashboard/pedidos",
          label: "Pedidos",
          icon: ClipboardList,
          badge: overview && overview.pendingOrders > 0 ? overview.pendingOrders : null,
        },
        { href: "/dashboard/estadisticas", label: "Estadísticas", icon: BarChart3 },
        { href: "/dashboard/categorias", label: "Categorías", icon: LayoutGrid },
        { href: "/dashboard/productos", label: "Productos", icon: Package2 },
        { href: "/dashboard/pagos", label: "Pagos", icon: CreditCard },
        { href: "/dashboard/configuracion", label: "Configuración", icon: Settings2 },
      ]
    : context.business.onboardingCompletedAt
      ? [
        {
          href: "/dashboard/pedidos",
          label: "Pedidos",
          icon: ClipboardList,
          badge: overview && overview.pendingOrders > 0 ? overview.pendingOrders : null,
        },
      ]
      : showAdminLinks
        ? [
        { href: "/dashboard/onboarding", label: "Primeros pasos", icon: Sparkles },
        { href: "/dashboard/configuracion", label: "Configuración", icon: Settings2 },
        { href: "/dashboard/categorias", label: "Categorías", icon: LayoutGrid },
        { href: "/dashboard/productos", label: "Productos", icon: Package2 },
      ]
        : [
          {
            href: "/dashboard/pedidos",
            label: "Pedidos",
            icon: ClipboardList,
            badge: overview && overview.pendingOrders > 0 ? overview.pendingOrders : null,
          },
        ];

  return (
    <div
      className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]"
      style={
        {
          "--color-background": "#F7F4EF",
          "--color-foreground": "#1F1A17",
          "--color-muted": "#6B625A",
          "--color-accent": "#C65A2E",
          "--color-accent-hover": "#A94A24",
          "--color-border": "#E7DED2",
          "--color-surface": "#FFFDFC",
          "--color-surface-strong": "#F5ECE2",
          fontFamily: "var(--font-geist-sans), sans-serif",
        } as CSSProperties
      }
    >
      <DashboardLiveNotifier businessId={context.business.id} />
      <div className="grid min-h-screen w-full xl:grid-cols-[244px_minmax(0,1fr)]">
        <aside className="border-b border-[var(--color-border)] bg-[var(--color-surface)] xl:min-h-screen xl:border-b-0 xl:border-r">
          <div className="border-b border-[var(--color-border)] px-4 py-4 md:px-6 xl:px-5">
            <Link href="/" className="text-base font-semibold tracking-tight text-[var(--color-foreground)]">
              Restopickup
            </Link>
            <p className="mt-1 truncate text-xs text-[var(--color-muted)]">
              {context.user.email ?? "Usuario del local"}
            </p>
          </div>

          <div className="border-b border-[var(--color-border)] px-4 py-4 md:px-6 xl:px-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between xl:block">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Local
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[var(--color-foreground)]">
                  {context.business.name}
                </h2>
                <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                  {context.membership.isAdminRole
                    ? context.isAdminModeEnabled
                      ? "Modo admin"
                      : "Modo colaborador"
                    : "Colaborador"}
                </p>
                {!context.business.onboardingCompletedAt ? (
                  <p className="mt-3 inline-flex rounded-full bg-[rgba(198,90,46,0.1)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                    Onboarding pendiente
                  </p>
                ) : null}
                {showAdminLinks ? (
                  <form action={toggleBusinessTemporaryClosedAction} className="mt-4">
                    <input
                      type="hidden"
                      name="isTemporarilyClosed"
                      value={context.business.isTemporarilyClosed ? "false" : "true"}
                    />
                    <button
                      type="submit"
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                        context.business.isTemporarilyClosed
                          ? "border-[#B54232] bg-[rgba(181,66,50,0.12)] text-[#B54232]"
                          : "border-[#12D684] bg-[rgba(18,214,132,0.16)] text-[#06985B]"
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          context.business.isTemporarilyClosed
                            ? "bg-[#B54232]"
                            : "bg-[#12D684]"
                        }`}
                      />
                      {context.business.isTemporarilyClosed ? "Cerrado" : "Abierto"}
                    </button>
                  </form>
                ) : null}
              </div>

              {context.membership.isAdminRole ? (
                context.isAdminModeEnabled ? (
                  <form action={lockAdminModeAction} className="lg:min-w-[220px] xl:mt-4 xl:min-w-0">
                    <SubmitButton
                      label="Salir de modo admin"
                      pendingLabel="Saliendo..."
                      className="inline-flex w-full items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground)] transition enabled:hover:bg-[var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </form>
                ) : (
                  <Link
                    href={`/dashboard/admin-mode${context.business.onboardingCompletedAt ? "?next=/dashboard" : "?next=/dashboard/onboarding"}`}
                    className="inline-flex items-center justify-center rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)] lg:min-w-[220px] xl:mt-4 xl:min-w-0"
                  >
                    Entrar a modo admin
                  </Link>
                )
              ) : null}
            </div>
          </div>

          <nav className="overflow-x-auto border-t border-[var(--color-border)] px-4 py-4 md:sticky md:top-0 md:z-30 md:bg-[var(--color-surface)] md:px-6 md:shadow-[0_1px_0_0_var(--color-border)] xl:static xl:border-t-0 xl:overflow-visible xl:px-3 xl:shadow-none">
            <div className="flex gap-2 pb-1 xl:flex-col xl:gap-1 xl:pb-0">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex shrink-0 items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-muted)] transition hover:bg-[rgba(198,90,46,0.08)] hover:text-[var(--color-accent)]"
                >
                  <span className="flex items-center gap-3">
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </span>
                  {"badge" in link && link.badge ? (
                    <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-[var(--color-accent)] px-2.5 py-1 text-[11px] font-semibold text-white">
                      {link.badge}
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          </nav>

          <form action={logoutAction} className="border-t border-[var(--color-border)] px-4 py-4 md:px-6 xl:mt-auto xl:px-3">
            <SubmitButton
              label="Cerrar sesión"
              pendingLabel="Saliendo..."
              className="inline-flex w-full items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground)] transition enabled:hover:bg-[var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
            />
          </form>
        </aside>

        <main className="min-w-0 px-4 py-4 md:px-6 xl:px-8">
          <div className="flex min-h-[70vh] flex-col gap-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
