"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  clearStoredCustomerProfile,
  getRecentPurchases,
  getStoredCustomerLocation,
  getStoredCustomerProfile,
  saveStoredCustomerProfile,
} from "@/lib/customer-profile";

export function CustomerAccountPage() {
  const [profile, setProfile] = useState(() => getStoredCustomerProfile());
  const [savedState, setSavedState] = useState<"idle" | "saved">("idle");
  const recentPurchases = useMemo(() => getRecentPurchases(), []);
  const storedLocation = useMemo(() => getStoredCustomerLocation(), []);

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveStoredCustomerProfile(profile);
    setSavedState("saved");
    window.setTimeout(() => setSavedState("idle"), 2000);
  }

  function handleClear() {
    clearStoredCustomerProfile();
    setProfile({
      name: "",
      phone: "",
      favoriteBusinesses: [],
    });
    setSavedState("idle");
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-6 py-10 md:px-10 lg:px-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
            Cuenta liviana
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Guardá tus datos para comprar más rápido
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-muted)]">
            No hace falta crear una cuenta obligatoria ni completar un perfil largo.
            Este espacio solo guarda lo necesario para que tu próxima compra sea más cómoda.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-7 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Tus datos
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              Se usan para precargar el checkout y dejar tus locales favoritos a mano.
            </p>

            <form onSubmit={handleSave} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-foreground)]">
                  Nombre
                </label>
                <input
                  value={profile.name}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, name: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
                  placeholder="Ej. Martina"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-foreground)]">
                  Celular
                </label>
                <input
                  value={profile.phone}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, phone: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
                  placeholder="+598..."
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  Limpiar datos
                </button>
              </div>

              {savedState === "saved" ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Listo, tus datos quedaron guardados en este dispositivo.
                </div>
              ) : null}
            </form>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Ubicación
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                {storedLocation
                  ? "Ya guardamos una ubicación reciente para ayudarte a ordenar mejor los locales cercanos."
                  : "Cuando habilites ubicación desde la home, la recordamos para mostrarte opciones más convenientes."}
              </p>
            </div>

            <div className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Compras recientes
              </p>
              <div className="mt-4 space-y-3">
                {recentPurchases.length === 0 ? (
                  <p className="text-sm leading-7 text-[var(--color-muted)]">
                    Todavía no hay compras guardadas en este dispositivo.
                  </p>
                ) : (
                  recentPurchases.slice(0, 4).map((purchase) => (
                    <Link
                      key={`${purchase.businessSlug}-${purchase.orderNumber}`}
                      href={`/locales/${purchase.businessSlug}`}
                      className="block rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 transition hover:border-[var(--color-accent)]"
                    >
                      <p className="font-medium text-[var(--color-foreground)]">
                        {purchase.businessName}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        Pedido #{purchase.orderNumber}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>

        <section className="rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-7 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Favoritos
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
                Locales guardados
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {profile.favoriteBusinesses.length === 0 ? (
              <p className="text-sm leading-7 text-[var(--color-muted)]">
                Todavía no guardaste locales. Desde el menú de cada local podés tocar
                “Guardar” para tenerlo siempre a mano.
              </p>
            ) : (
              profile.favoriteBusinesses.map((favorite) => (
                <Link
                  key={favorite.slug}
                  href={`/locales/${favorite.slug}`}
                  className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition hover:border-[var(--color-accent)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[1rem] border border-[var(--color-border)] bg-white">
                      {favorite.profileImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={favorite.profileImageUrl}
                          alt={favorite.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-[var(--color-foreground)]">
                          {favorite.name.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--color-foreground)]">
                        {favorite.name}
                      </p>
                      <p className="truncate text-sm text-[var(--color-muted)]">
                        {favorite.pickupAddress}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
