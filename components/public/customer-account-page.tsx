"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

import {
  clearStoredActiveOrder,
  CUSTOMER_PROFILE_UPDATED_EVENT,
  type CustomerProfile,
  getRecentPurchases,
  getStoredActiveOrder,
  getStoredCustomerLocation,
  getStoredCustomerProfile,
  saveStoredCustomerProfile,
} from "@/lib/customer-profile";
import {
  type ActiveCustomerOrder,
  bootstrapCustomerAccountState,
  getCustomerActiveOrders,
  getCustomerUser,
  saveCustomerProfileToAccount,
  sendCustomerMagicLink,
  signOutCustomer,
} from "@/lib/customer-account-client";
import { CustomerSessionBootstrap } from "@/components/public/customer-session-bootstrap";

function ProfileField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "email" | "tel";
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--color-foreground)]">
        {label}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 text-sm text-[var(--color-foreground)] outline-none transition focus:border-[var(--color-accent)]"
      />
    </label>
  );
}

function AccountSectionIcon({ type }: { type: "profile" | "favorites" | "orders" }) {
  if (type === "profile") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none">
        <circle cx="10" cy="6.5" r="3.25" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M4.75 16.25c.9-2.4 2.9-3.75 5.25-3.75s4.35 1.35 5.25 3.75"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "favorites") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none">
        <path
          d="m10 16.1-4.86-4.72A3.25 3.25 0 1 1 9.9 6.9l.1.11.1-.11a3.25 3.25 0 1 1 4.76 4.48L10 16.1Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none">
      <path
        d="M5 4.75h10M5 10h10M5 15.25h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="14.75" cy="15.25" r="1.5" fill="currentColor" />
    </svg>
  );
}

function AccountSection({
  icon,
  title,
  meta,
  isOpen,
  onToggle,
  children,
}: {
  icon: "profile" | "favorites" | "orders";
  title: string;
  meta?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/40"
        aria-expanded={isOpen}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--color-accent)] shadow-[0_8px_24px_rgba(39,24,13,0.06)]">
            <AccountSectionIcon type={icon} />
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold text-[var(--color-foreground)]">{title}</p>
            {meta ? (
              <p className="mt-0.5 truncate text-sm text-[var(--color-muted)]">{meta}</p>
            ) : null}
          </div>
        </div>
        <span
          className={`shrink-0 text-[var(--color-muted)] transition ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
            <path
              d="m5.75 8 4.25 4.25L14.25 8"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {isOpen ? <div className="border-t border-[var(--color-border)] px-5 py-5">{children}</div> : null}
    </section>
  );
}

export function CustomerAccountPage() {
  const [profile, setProfile] = useState<CustomerProfile>({
    name: "",
    phone: "",
    favoriteBusinesses: [],
  });
  const [email, setEmail] = useState("");
  const [savedState, setSavedState] = useState<"idle" | "saved">("idle");
  const [authState, setAuthState] = useState<"loading" | "guest" | "authenticated">("loading");
  const [loginState, setLoginState] = useState<"idle" | "sent" | "error">("idle");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [openSection, setOpenSection] = useState<"profile" | "favorites" | "orders">("profile");
  const [recentPurchases, setRecentPurchases] = useState<ReturnType<typeof getRecentPurchases>>(
    [],
  );
  const [activeOrders, setActiveOrders] = useState<ActiveCustomerOrder[]>([]);
  const [previousOrders, setPreviousOrders] = useState<ActiveCustomerOrder[]>([]);
  const [storedLocation, setStoredLocation] = useState<ReturnType<typeof getStoredCustomerLocation>>(
    null,
  );
  const [storedActiveOrder, setStoredActiveOrder] = useState<ReturnType<typeof getStoredActiveOrder>>(
    null,
  );

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const storedProfile = getStoredCustomerProfile();
      const user = await getCustomerUser();

      if (!isMounted) {
        return;
      }

      setProfile(storedProfile);
      setRecentPurchases(getRecentPurchases());
      setStoredLocation(getStoredCustomerLocation());
      setStoredActiveOrder(getStoredActiveOrder());
      setCurrentUserEmail(user?.email ?? null);
      setEmail(user?.email ?? "");

      if (!user) {
        setAuthState("guest");
        return;
      }

      const [bootstrapped, orders] = await Promise.all([
        bootstrapCustomerAccountState(),
        getCustomerActiveOrders(),
      ]);

      if (!isMounted) {
        return;
      }

      if (bootstrapped) {
        setProfile(bootstrapped.profile);
        setRecentPurchases(bootstrapped.recentPurchases);
        setCurrentUserEmail(bootstrapped.user.email ?? null);
        setEmail(bootstrapped.user.email ?? "");
      }

      setActiveOrders(orders.activeOrders);
      setPreviousOrders(orders.previousOrders);

      setAuthState("authenticated");
    };

    initialize();

    function syncFromStorage() {
      setProfile(getStoredCustomerProfile());
      setRecentPurchases(getRecentPurchases());
      setStoredLocation(getStoredCustomerLocation());
      setStoredActiveOrder(getStoredActiveOrder());
    }

    window.addEventListener(CUSTOMER_PROFILE_UPDATED_EVENT, syncFromStorage);

    return () => {
      isMounted = false;
      window.removeEventListener(CUSTOMER_PROFILE_UPDATED_EVENT, syncFromStorage);
    };
  }, []);

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      await saveCustomerProfileToAccount(profile);
      setSavedState("saved");
      window.setTimeout(() => setSavedState("idle"), 2200);
    });
  }

  function handleMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError(null);
    setLoginState("idle");

    const trimmedName = profile.name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      setLoginState("error");
      setLoginError("Completá tu nombre y tu email para enviarte el acceso.");
      return;
    }

    startTransition(async () => {
      try {
        saveStoredCustomerProfile({
          ...profile,
          name: trimmedName,
          phone: profile.phone.trim(),
        });
        await sendCustomerMagicLink(trimmedEmail);
        setLoginState("sent");
      } catch (error) {
        setLoginState("error");
        setLoginError(error instanceof Error ? error.message : "No pudimos enviar el link.");
      }
    });
  }

  function handleClearPersonalData() {
    setProfile((current) => ({
      ...current,
      name: "",
      phone: "",
    }));
    setSavedState("idle");
  }

  function handleSignOut() {
    startTransition(async () => {
      await signOutCustomer();
      clearStoredActiveOrder();
      setAuthState("guest");
      setCurrentUserEmail(null);
      setActiveOrders([]);
      setPreviousOrders([]);
      setStoredActiveOrder(null);
    });
  }

  const hasFavorites = profile.favoriteBusinesses.length > 0;
  const hasRecentPurchases = recentPurchases.length > 0;
  const hasActiveOrders = activeOrders.length > 0;
  const hasPreviousOrders = previousOrders.length > 0;
  const hasStoredActiveOrder = Boolean(storedActiveOrder);

  function formatOrderTime(value: string, timeZone: string) {
    const resolvedTimeZone =
      !timeZone || timeZone === "UTC" ? "America/Montevideo" : timeZone;

    return new Intl.DateTimeFormat("es-UY", {
      day: "numeric",
      month: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: resolvedTimeZone,
    }).format(new Date(value));
  }

  function formatOrderAmount(amount: number, currencyCode: string) {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatOrderItems(
    items: {
      productName: string;
      quantity: number;
    }[]
  ) {
    return items.map((item) => `${item.quantity}x ${item.productName}`).join(" · ");
  }

  const activeOrderFallback = !hasActiveOrders && storedActiveOrder ? storedActiveOrder : null;

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-6 py-8 md:px-10 md:py-10 lg:px-12">
      <CustomerSessionBootstrap />

      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-[2.4rem] border border-[var(--color-border)] bg-white/90 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
          <div className="border-b border-[var(--color-border)] px-6 py-5 md:px-8 lg:px-10">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                  Cuenta cliente
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] md:text-5xl">
                  Tu cuenta en Restopickup.
                </h1>
                <p className="mt-3 text-sm leading-7 text-[var(--color-muted)] md:text-base">
                  Guardá tus favoritos, tus datos y tus compras anteriores.
                </p>
              </div>

              {authState !== "authenticated" ? (
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    Volver al inicio
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          {authState !== "authenticated" ? (
            <div className="grid gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.85fr)]">
              <section className="order-2 border-t border-[var(--color-border)] px-6 py-6 md:px-8 lg:order-1 lg:border-t-0 lg:border-r lg:px-10 lg:py-10">
                <div className="max-w-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-secondary)]">
                    Tu cuenta
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-foreground)] md:text-3xl">
                    Todo más a mano.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                    Guardá tus datos para comprar más rápido y encontrá fácil los locales que más usás.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                      <p className="text-sm font-semibold text-[var(--color-foreground)]">
                        Checkout
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                        Tus datos quedan listos para completar el pedido más rápido.
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                      <p className="text-sm font-semibold text-[var(--color-foreground)]">
                        Favoritos y compras
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                        Volvé rápido a los locales donde ya pediste.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="order-1 px-6 py-6 md:px-8 lg:order-2 lg:px-10 lg:py-10">
                <div className="mx-auto max-w-lg">
                  <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
                    Iniciar sesión o registrarte
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                    Ingresá tus datos y te enviamos el acceso por email.
                  </p>

                  <form onSubmit={handleMagicLink} className="mt-6 space-y-4">
                    <ProfileField
                      label="Nombre"
                      value={profile.name}
                      onChange={(value) =>
                        setProfile((current) => ({ ...current, name: value }))
                      }
                      placeholder="Ej. Daniela"
                      required
                    />
                    <ProfileField
                      label="Email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      placeholder="tu@email.com"
                      required
                    />
                    <ProfileField
                      label="Celular"
                      type="tel"
                      value={profile.phone}
                      onChange={(value) =>
                        setProfile((current) => ({ ...current, phone: value }))
                      }
                      placeholder="+598..."
                    />

                    <button
                      type="submit"
                      disabled={isPending}
                      className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
                    >
                      {isPending ? "Enviando acceso..." : "Iniciar sesión / registrarse"}
                    </button>
                  </form>

                  {loginState === "sent" ? (
                    <div className="mt-4 rounded-2xl border border-[rgba(63,92,78,0.18)] bg-[rgba(63,92,78,0.08)] px-4 py-3 text-sm text-[var(--color-secondary)]">
                      Te enviamos un email para que puedas ingresar.
                    </div>
                  ) : null}

                  {loginError ? (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                      {loginError}
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          ) : (
            <div className="px-6 py-6 md:px-8 lg:px-10 lg:py-8">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                    Mi cuenta
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-foreground)] md:text-3xl">
                    {profile.name.trim() || "Tu cuenta"}
                  </h2>
                  {currentUserEmail ? (
                    <p className="mt-2 text-sm text-[var(--color-muted)]">{currentUserEmail}</p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    Ir al inicio
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <AccountSection
                  icon="profile"
                  title="Info personal"
                  meta={
                    profile.phone.trim()
                      ? `${profile.name.trim() || "Sin nombre"} · ${profile.phone.trim()}`
                      : profile.name.trim() || "Nombre, celular y email"
                  }
                  isOpen={openSection === "profile"}
                  onToggle={() =>
                    setOpenSection((current) => (current === "profile" ? "favorites" : "profile"))
                  }
                >
                  <form onSubmit={handleSave} className="grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <ProfileField
                        label="Nombre"
                        value={profile.name}
                        onChange={(value) =>
                          setProfile((current) => ({ ...current, name: value }))
                        }
                        placeholder="Ej. Daniela"
                      />
                    </div>
                    <ProfileField
                      label="Celular"
                      type="tel"
                      value={profile.phone}
                      onChange={(value) =>
                        setProfile((current) => ({ ...current, phone: value }))
                      }
                      placeholder="+598..."
                    />
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-[var(--color-foreground)]">
                        Email
                      </span>
                      <input
                        value={currentUserEmail ?? email}
                        disabled
                        className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3.5 text-sm text-[var(--color-muted)] outline-none"
                      />
                    </label>

                    <div className="md:col-span-2 flex flex-wrap gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
                      >
                        {isPending ? "Guardando..." : "Guardar cambios"}
                      </button>
                      <button
                        type="button"
                        onClick={handleClearPersonalData}
                        className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                      >
                        Limpiar
                      </button>
                    </div>

                    {savedState === "saved" ? (
                      <div className="md:col-span-2 rounded-2xl border border-[rgba(63,92,78,0.18)] bg-[rgba(63,92,78,0.08)] px-4 py-3 text-sm text-[var(--color-secondary)]">
                        Tus datos quedaron actualizados.
                      </div>
                    ) : null}

                    <div className="md:col-span-2 rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-muted)]">
                      {storedLocation
                        ? "Ya hay una ubicación reciente guardada."
                        : "La ubicación se guarda cuando la activás desde la home."}
                    </div>
                  </form>
                </AccountSection>

                <AccountSection
                  icon="favorites"
                  title="Favoritos"
                  meta={
                    hasFavorites
                      ? `${profile.favoriteBusinesses.length} locales guardados`
                      : "Locales guardados"
                  }
                  isOpen={openSection === "favorites"}
                  onToggle={() =>
                    setOpenSection((current) => (current === "favorites" ? "orders" : "favorites"))
                  }
                >
                  <div className="space-y-3">
                    {hasFavorites ? (
                      profile.favoriteBusinesses.map((favorite) => (
                        <Link
                          key={favorite.slug}
                          href={`/locales/${favorite.slug}`}
                          className="flex items-center gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-white p-4 transition hover:border-[var(--color-accent)]"
                        >
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface)]">
                            {favorite.profileImageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={favorite.profileImageUrl}
                                alt={favorite.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-semibold text-[var(--color-foreground)]">
                                {favorite.name.slice(0, 1).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[var(--color-foreground)]">
                              {favorite.name}
                            </p>
                            <p className="mt-1 truncate text-sm text-[var(--color-muted)]">
                              {favorite.pickupAddress}
                            </p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="rounded-[1.5rem] border border-dashed border-[var(--color-border)] bg-white p-5 text-sm leading-7 text-[var(--color-muted)]">
                        Todavía no guardaste locales.
                      </div>
                    )}
                  </div>
                </AccountSection>

                <AccountSection
                  icon="orders"
                  title="Compras"
                  meta={
                    hasActiveOrders
                      ? `${activeOrders.length} pedido${activeOrders.length === 1 ? "" : "s"} en curso`
                      : hasStoredActiveOrder
                        ? "1 pedido en curso"
                      : hasPreviousOrders
                        ? `${previousOrders.length} compra${previousOrders.length === 1 ? "" : "s"} anterior${previousOrders.length === 1 ? "" : "es"}`
                        : hasRecentPurchases
                          ? `${recentPurchases.length} locales con compras`
                        : "Compras anteriores"
                  }
                  isOpen={openSection === "orders"}
                  onToggle={() =>
                    setOpenSection((current) => (current === "orders" ? "profile" : "orders"))
                  }
                >
                  <div className="space-y-3">
                    {hasActiveOrders ? (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                          En curso
                        </p>
                        {activeOrders.map((order) => (
                          <Link
                            key={order.id}
                            href={`/locales/${order.businessSlug}/pedido/${order.orderNumber}`}
                            className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-[rgba(63,92,78,0.16)] bg-[rgba(63,92,78,0.06)] p-4 transition hover:border-[var(--color-accent)]"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-[var(--color-foreground)]">
                                {order.businessName}
                              </p>
                              <p className="mt-1 text-sm text-[var(--color-muted)]">
                                {formatOrderItems(order.items)}
                              </p>
                              <p className="mt-1 text-sm text-[var(--color-muted)]">
                                {order.estimatedReadyAt
                                  ? `Retiro estimado ${formatOrderTime(order.estimatedReadyAt, order.businessTimezone)}`
                                  : `Hecho el ${formatOrderTime(order.placedAt, order.businessTimezone)}`}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-semibold text-[var(--color-foreground)]">
                                {formatOrderAmount(order.totalAmount, order.currencyCode)}
                              </p>
                              <span className="mt-1 inline-flex rounded-full border border-[rgba(63,92,78,0.18)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-secondary)]">
                                Ver pedido
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : activeOrderFallback ? (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                          En curso
                        </p>
                        <Link
                          href={`/locales/${activeOrderFallback.businessSlug}/pedido/${activeOrderFallback.orderNumber}`}
                          className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-[rgba(63,92,78,0.16)] bg-[rgba(63,92,78,0.06)] p-4 transition hover:border-[var(--color-accent)]"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-[var(--color-foreground)]">
                              {activeOrderFallback.businessName}
                            </p>
                            <p className="mt-1 text-sm text-[var(--color-muted)]">
                              {activeOrderFallback.itemSummary || `Pedido #${activeOrderFallback.orderNumber}`}
                            </p>
                            <p className="mt-1 text-sm text-[var(--color-muted)]">
                              {activeOrderFallback.estimatedReadyAt
                                ? `Retiro estimado ${formatOrderTime(activeOrderFallback.estimatedReadyAt, "America/Montevideo")}`
                                : `Hecho el ${formatOrderTime(activeOrderFallback.placedAt, "America/Montevideo")}`}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            {typeof activeOrderFallback.totalAmount === "number" &&
                            activeOrderFallback.currencyCode ? (
                              <p className="text-sm font-semibold text-[var(--color-foreground)]">
                                {formatOrderAmount(
                                  activeOrderFallback.totalAmount,
                                  activeOrderFallback.currencyCode,
                                )}
                              </p>
                            ) : null}
                            <span className="mt-1 inline-flex rounded-full border border-[rgba(63,92,78,0.18)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-secondary)]">
                              Ver pedido
                            </span>
                          </div>
                        </Link>
                      </div>
                    ) : null}

                    {hasPreviousOrders ? (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                          Anteriores
                        </p>
                        {previousOrders.map((order) => (
                          <Link
                            key={`${order.businessSlug}-${order.orderNumber}`}
                            href={`/locales/${order.businessSlug}`}
                            className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-white p-4 transition hover:border-[var(--color-accent)]"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-[var(--color-foreground)]">
                                {order.businessName}
                              </p>
                              <p className="mt-1 text-sm text-[var(--color-muted)]">
                                {formatOrderItems(order.items)}
                              </p>
                              <p className="mt-1 text-sm text-[var(--color-muted)]">
                                {formatOrderTime(order.placedAt, order.businessTimezone)}
                              </p>
                            </div>
                            <p className="shrink-0 text-sm font-semibold text-[var(--color-foreground)]">
                              {formatOrderAmount(order.totalAmount, order.currencyCode)}
                            </p>
                          </Link>
                        ))}
                      </div>
                    ) : hasRecentPurchases ? (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                          Anteriores
                        </p>
                        {recentPurchases.map((purchase) => (
                          <Link
                            key={`${purchase.businessSlug}-${purchase.orderNumber}`}
                            href={`/locales/${purchase.businessSlug}/pedido/${purchase.orderNumber}`}
                            className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-white p-4 transition hover:border-[var(--color-accent)]"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-[var(--color-foreground)]">
                                {purchase.businessName}
                              </p>
                              <p className="mt-1 text-sm text-[var(--color-muted)]">
                                {purchase.itemSummary || `Pedido #${purchase.orderNumber}`}
                              </p>
                              {typeof purchase.totalAmount === "number" && purchase.currencyCode ? (
                                <p className="mt-1 text-sm text-[var(--color-muted)]">
                                  {formatOrderAmount(purchase.totalAmount, purchase.currencyCode)}
                                </p>
                              ) : null}
                            </div>
                            <span className="shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-muted)]">
                              Ver pedido
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : !hasActiveOrders ? (
                      <div className="rounded-[1.5rem] border border-dashed border-[var(--color-border)] bg-white p-5 text-sm leading-7 text-[var(--color-muted)]">
                        Todavía no hay compras guardadas.
                      </div>
                    ) : null}
                  </div>
                </AccountSection>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
