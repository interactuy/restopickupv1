import Link from "next/link";

import { SubmitButton } from "@/components/dashboard/submit-button";
import { logoutAction } from "@/lib/dashboard/actions";
import { requireInternalAdminContext } from "@/lib/admin/server";

type AdminLayoutProps = {
  children: React.ReactNode;
};

const links = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/solicitudes", label: "Solicitudes" },
  { href: "/admin/negocios", label: "Negocios" },
];

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const context = await requireInternalAdminContext();

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-8 md:px-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-12">
        <aside className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
          <Link href="/" className="text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
            Restopickup
          </Link>

          <div className="mt-6 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
              Panel interno
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[var(--color-foreground)]">
              Revisión de locales
            </h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {context.user.email}
            </p>
          </div>

          <nav className="mt-6 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-full px-4 py-2 text-sm font-medium text-[var(--color-foreground)] transition hover:bg-[var(--color-surface)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <form action={logoutAction} className="mt-8">
            <SubmitButton
              label="Cerrar sesión"
              pendingLabel="Saliendo..."
              className="inline-flex w-full items-center justify-center rounded-full border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground)] transition enabled:hover:border-[var(--color-accent)] enabled:hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
            />
          </form>
        </aside>

        <div className="flex min-h-[70vh] flex-col gap-6">{children}</div>
      </div>
    </div>
  );
}
