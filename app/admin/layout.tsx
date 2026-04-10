import Link from "next/link";
import type { CSSProperties } from "react";
import {
  Activity,
  BarChart3,
  Building2,
  ClipboardList,
  FileClock,
  Gauge,
  Headphones,
  Landmark,
  Settings2,
} from "lucide-react";

import { SubmitButton } from "@/components/dashboard/submit-button";
import { logoutAction } from "@/lib/dashboard/actions";
import { requireInternalAdminContext } from "@/lib/admin/server";

type AdminLayoutProps = {
  children: React.ReactNode;
};

const links = [
  { href: "/admin", label: "Operación", icon: Gauge },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: ClipboardList },
  { href: "/admin/negocios", label: "Negocios", icon: Building2 },
  { href: "/admin/pedidos", label: "Pedidos", icon: Activity },
  { href: "/admin/soporte", label: "Soporte", icon: Headphones },
  { href: "/admin/comisiones", label: "Finanzas", icon: Landmark },
  { href: "/admin/estadisticas", label: "Estadísticas", icon: BarChart3 },
  { href: "/admin/plataforma", label: "Plataforma", icon: Settings2 },
  { href: "/admin/auditoria", label: "Auditoría", icon: FileClock },
];

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const context = await requireInternalAdminContext();

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-950"
      style={
        {
          "--color-background": "#f8fafc",
          "--color-foreground": "#020617",
          "--color-muted": "#64748b",
          "--color-accent": "#059669",
          "--color-border": "#e2e8f0",
          "--color-surface": "#f8fafc",
          "--color-surface-strong": "#ecfdf5",
          fontFamily: "var(--font-geist-sans), sans-serif",
        } as CSSProperties
      }
    >
      <div className="grid min-h-screen w-full lg:grid-cols-[244px_minmax(0,1fr)]">
        <aside className="border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <Link href="/admin" className="text-base font-semibold tracking-tight text-slate-950">
              Restopickup
            </Link>
            <p className="mt-1 truncate text-xs text-slate-500">{context.user.email}</p>
          </div>

          <nav className="space-y-1 px-3 py-4">
            {links.map((link) => {
              const Icon = link.icon;

              return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
              );
            })}
          </nav>

          <form action={logoutAction} className="mt-auto px-3 py-4">
            <SubmitButton
              label="Cerrar sesión"
              pendingLabel="Saliendo..."
              className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </form>
        </aside>

        <main className="min-w-0 px-4 py-4 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
