"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { FloatingCartButton } from "@/components/cart/floating-cart-button";
import type {
  PublicBusinessCatalog,
  PublicCategory,
} from "@/lib/public-catalog";
import {
  getBusinessOpenStatusLabel,
  getTodayBusinessHoursLabel,
  formatPrepTimeRange,
} from "@/lib/public-catalog";

import { EmptyState } from "@/components/public/empty-state";
import { ProductCard } from "@/components/public/product-card";

type BusinessCatalogProps = {
  catalog: PublicBusinessCatalog;
};

function CategoryShortcut({
  category,
  productCount,
}: {
  category: PublicCategory;
  productCount: number;
}) {
  return (
    <a
      href={`#${category.slug}`}
      className="inline-flex shrink-0 items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
    >
      {category.name}
      <span className="ml-2 text-[var(--color-muted)]">{productCount}</span>
    </a>
  );
}

function buildGoogleMapsUrl(address: string) {
  const encodedAddress = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
}

function buildMapboxStaticMapUrl(params: {
  token: string;
  latitude: number;
  longitude: number;
}) {
  const { token, latitude, longitude } = params;
  const marker = `pin-s+cc7a30(${longitude},${latitude})`;
  const viewport = `${longitude},${latitude},15,0`;

  return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${marker}/${viewport}/800x360?access_token=${token}`;
}

export function BusinessCatalog({ catalog }: BusinessCatalogProps) {
  const { business, categories, products } = catalog;
  const { addItem, getItemCount } = useCart();
  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const cartCount = getItemCount(business.id);
  const prepTimeLabel = formatPrepTimeRange(
    business.prepTimeMinMinutes,
    business.prepTimeMaxMinutes
  );
  const openStatus = getBusinessOpenStatusLabel(business);
  const todayHoursLabel = getTodayBusinessHoursLabel(business);
  const googleMapsUrl = buildGoogleMapsUrl(business.pickupAddress);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mapboxPreviewUrl =
    mapboxToken && business.latitude != null && business.longitude != null
      ? buildMapboxStaticMapUrl({
          token: mapboxToken,
          latitude: business.latitude,
          longitude: business.longitude,
        })
      : null;
  const businessDescription =
    business.description?.trim() ||
    "Pedí online, elegí tus productos y pasá a retirar cuando tu pedido esté listo.";
  const isBusinessClosed = Boolean(openStatus);

  useEffect(() => {
    if (!isHoursOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsHoursOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isHoursOpen]);

  const categoriesWithProducts = categories
    .map((category) => ({
      ...category,
      products: products.filter((product) => product.categoryId === category.id),
    }))
    .filter((category) => category.products.length > 0);

  const uncategorizedProducts = products.filter((product) => !product.categoryId);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <section className="border-b border-[var(--color-border)] pb-6 md:pb-8">
        <div className="relative h-28 overflow-hidden border-b border-[var(--color-border)] sm:h-36 md:h-48">
          {business.coverImageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={business.coverImageUrl}
                alt={`Portada de ${business.name}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,18,12,0.18)_0%,rgba(26,18,12,0.5)_100%)]" />
            </>
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(198,122,48,0.24),_rgba(248,241,231,0.62)_58%,_transparent_100%)]" />
          )}
        </div>

        <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-12">
          <div className="relative -mt-8 rounded-[2rem] border border-[var(--color-border)] bg-white/95 p-5 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm md:-mt-10 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <Link
                href="/"
                className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]"
              >
                Restopickup
              </Link>

              {hasMounted && cartCount > 0 ? (
                <Link
                  href={`/locales/${business.slug}/carrito`}
                  className="rounded-full border border-[var(--color-accent)] bg-[rgba(198,122,48,0.1)] px-4 py-2 text-sm font-medium text-[var(--color-accent)] transition hover:brightness-95"
                >
                  Ver carrito · {cartCount}
                </Link>
              ) : null}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.75fr)] lg:items-start">
              <div className="min-w-0">
                <div className="flex items-start gap-4">
                  <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_16px_45px_rgba(39,24,13,0.08)] sm:h-20 sm:w-20">
                    {business.profileImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={business.profileImageUrl}
                        alt={business.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-[var(--color-foreground)]">
                        {business.name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 pt-1">
                    <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl md:text-5xl">
                      {business.name}
                    </h1>
                  </div>
                </div>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-muted)] sm:text-base sm:leading-8">
                  {businessDescription}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  {openStatus ? (
                    <span className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700">
                      {openStatus.label}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setIsHoursOpen(true)}
                    className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    {todayHoursLabel}
                  </button>
                  {prepTimeLabel ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-foreground)]">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        className="h-4 w-4 text-[var(--color-accent)]"
                        fill="none"
                      >
                        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.7" />
                        <path d="M10 6.5v4l2.7 1.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Listo en {prepTimeLabel}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="border-t border-[var(--color-border)] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                  Retiro en local
                </p>
                <p className="text-base font-medium leading-7 text-[var(--color-foreground)]">
                  {business.pickupAddress}
                </p>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative mt-4 block overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,#f6ecde_0%,#efe4d5_48%,#e5dbc9_100%)]"
                >
                  {mapboxPreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mapboxPreviewUrl}
                      alt={`Mapa de ${business.name}`}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 opacity-60">
                        <div className="absolute left-[-10%] top-[25%] h-12 w-[70%] rotate-6 rounded-full border-2 border-white/70" />
                        <div className="absolute right-[-8%] top-[54%] h-10 w-[62%] -rotate-12 rounded-full border-2 border-white/70" />
                        <div className="absolute left-[12%] top-[12%] h-[76%] w-[1px] bg-white/70" />
                        <div className="absolute left-[48%] top-[8%] h-[84%] w-[1px] bg-white/60" />
                        <div className="absolute left-[76%] top-[18%] h-[68%] w-[1px] bg-white/60" />
                        <div className="absolute left-[8%] top-[36%] h-[1px] w-[82%] bg-white/70" />
                        <div className="absolute left-[18%] top-[68%] h-[1px] w-[74%] bg-white/60" />
                      </div>
                      <div className="relative flex h-40 items-center justify-center">
                        <div className="relative">
                          <span className="absolute left-1/2 top-full h-6 w-6 -translate-x-1/2 rounded-full bg-[rgba(198,122,48,0.18)] blur-md" />
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 32 32"
                            className="relative h-12 w-12 text-[var(--color-accent)] drop-shadow-[0_10px_18px_rgba(198,122,48,0.22)]"
                            fill="currentColor"
                          >
                            <path d="M16 3c-4.9 0-8.9 4-8.9 8.9 0 6.6 8.9 16.1 8.9 16.1s8.9-9.5 8.9-16.1C24.9 7 20.9 3 16 3Zm0 12.2a3.3 3.3 0 1 1 0-6.7 3.3 3.3 0 0 1 0 6.7Z" />
                          </svg>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0.08)_100%)] transition group-hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(198,122,48,0.08)_100%)]" />
                </a>
              </div>
            </div>
          </div>

          {!isBusinessClosed && categoriesWithProducts.length > 0 ? (
            <div className="mt-5 -mx-6 overflow-x-auto px-6 pb-1 md:mx-0 md:px-0">
              <div className="flex min-w-max gap-3 md:min-w-0 md:flex-wrap">
                {categoriesWithProducts.map((category) => (
                  <CategoryShortcut
                    key={category.id}
                    category={category}
                    productCount={category.products.length}
                  />
                ))}
                {uncategorizedProducts.length > 0 ? (
                  <a
                    href="#destacados"
                    className="inline-flex shrink-0 items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    Destacados
                    <span className="ml-2 text-[var(--color-muted)]">
                      {uncategorizedProducts.length}
                    </span>
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl px-6 py-12 md:px-10 lg:px-12">
        <div className="flex flex-col gap-12">
          {isBusinessClosed ? (
            <EmptyState
              eyebrow="Local cerrado"
              title={openStatus?.label ?? "Este local no esta recibiendo pedidos ahora"}
              description="Volvé a revisar el horario desde la pill del hero y regresá cuando el local esté abierto para ver el menú completo."
            />
          ) : null}

          {!isBusinessClosed &&
          categoriesWithProducts.length === 0 &&
          uncategorizedProducts.length === 0 ? (
            <EmptyState
              eyebrow="Catalogo vacio"
              title="Este local todavia no publico productos"
              description="Cuando el negocio cargue categorias y productos activos, vas a poder verlos aca listos para retiro."
            />
          ) : null}

          {!isBusinessClosed &&
            categoriesWithProducts.map((category) => (
            <section key={category.id} id={category.slug} className="scroll-mt-24">
              <div className="mb-6 flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                  Categoria
                </p>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
                      {category.name}
                    </h2>
                    {category.description ? (
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
                        {category.description}
                      </p>
                    ) : null}
                  </div>
                  <p className="hidden text-sm text-[var(--color-muted)] md:block">
                    {category.products.length} opciones
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {category.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(
                      item,
                      lineId,
                      selectedOptions,
                      unitOptionsAmount,
                      customerNote
                    ) =>
                      addItem(
                        {
                          businessId: business.id,
                          businessSlug: business.slug,
                          businessName: business.name,
                          currencyCode: business.currencyCode,
                        },
                        item,
                        lineId,
                        selectedOptions,
                        unitOptionsAmount,
                        customerNote
                      )
                    }
                  />
                ))}
              </div>
            </section>
          ))}

          {!isBusinessClosed && uncategorizedProducts.length > 0 ? (
            <section id="destacados" className="scroll-mt-24">
              <div className="mb-6 flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                  Seleccion
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
                  Productos destacados
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {uncategorizedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(
                      item,
                      lineId,
                      selectedOptions,
                      unitOptionsAmount,
                      customerNote
                    ) =>
                      addItem(
                        {
                          businessId: business.id,
                          businessSlug: business.slug,
                          businessName: business.name,
                          currencyCode: business.currencyCode,
                        },
                        item,
                        lineId,
                        selectedOptions,
                        unitOptionsAmount,
                        customerNote
                      )
                    }
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <FloatingCartButton
        businessId={business.id}
        businessSlug={business.slug}
        currencyCode={business.currencyCode}
      />

      {isHoursOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(24,18,12,0.48)] px-4 py-8"
          onClick={() => setIsHoursOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-[2rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_28px_90px_rgba(39,24,13,0.2)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                  Horarios del local
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
                  {business.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsHoursOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                aria-label="Cerrar horarios"
              >
                <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                  <path
                    d="M5 5l10 10M15 5 5 15"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {business.businessHours.map((entry) => (
                <div
                  key={entry.day}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
                >
                  <span className="font-medium text-[var(--color-foreground)]">
                    {entry.label}
                  </span>
                  <span className="text-sm text-[var(--color-muted)]">
                    {entry.isClosed || !entry.openTime || !entry.closeTime
                      ? "Cerrado"
                      : `${entry.openTime} - ${entry.closeTime}`}
                  </span>
                </div>
              ))}
            </div>

            {business.isTemporarilyClosed ? (
              <p className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                El local marcó un cierre especial, así que por ahora no está tomando pedidos.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
