"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";

import { EmptyState } from "@/components/public/empty-state";
import type { HomePageData } from "@/lib/public-catalog";
import {
  formatPrepTimeRange,
  formatPrice,
  getBusinessOpenStatusLabel,
} from "@/lib/public-catalog";

type HomeLandingProps = {
  data: HomePageData;
};

function matchesSearch(value: string, query: string) {
  return value.toLowerCase().includes(query);
}

function buildGoogleMapsUrl(address: string) {
  const encodedAddress = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
}

export function HomeLanding({ data }: HomeLandingProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filteredBusinesses = deferredQuery
    ? data.topBusinesses.filter((business) =>
        [business.name, business.description ?? "", business.pickupAddress].some((value) =>
          matchesSearch(value, deferredQuery)
        )
      )
    : [];

  const filteredProducts = deferredQuery
    ? data.featuredProducts.filter((product) =>
        [product.name, product.description ?? "", product.business.name].some((value) =>
          matchesSearch(value, deferredQuery)
        )
      )
    : [];

  const businessSuggestions = filteredBusinesses.slice(0, 4);
  const productSuggestions = filteredProducts.slice(0, 4);

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <section className="relative bg-[linear-gradient(180deg,#f6ecde_0%,#f9f2e8_52%,#f8f1e7_100%)]">
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,_rgba(198,122,48,0.3),_transparent_58%)]" />
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[rgba(184,77,32,0.08)] blur-3xl" />
        <div className="absolute -right-16 top-8 h-80 w-80 rounded-full bg-[rgba(198,122,48,0.12)] blur-3xl" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-8 md:px-10 lg:px-12">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Restopickup
            </Link>
            <Link
              href="/solicitar-acceso"
              className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
            >
              ¿Tenés un local? Solicitar acceso
            </Link>
          </header>

          <div className="pb-10">
            <div className="max-w-5xl">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
                Pedí online y retirá sin vueltas
              </p>
              <h1 className="mt-6 max-w-5xl text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
                Tu comida lista para vos, sin esperas de más.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--color-muted)]">
                Buscá locales o platos, elegí lo que querés comer y pasá a retirar cuando esté pronto.
              </p>

              <div className="relative mt-8 max-w-4xl">
                <div className="flex items-center gap-3 rounded-[1.75rem] border border-[var(--color-border)] bg-white/95 px-4 py-4 shadow-[0_24px_80px_rgba(39,24,13,0.08)] backdrop-blur-sm">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className="h-5 w-5 shrink-0 text-[var(--color-muted)]"
                    fill="none"
                  >
                    <circle cx="9" cy="9" r="5.75" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M13.5 13.5 17 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar locales, burgers, pizzas, wraps..."
                    className="w-full bg-transparent text-base outline-none placeholder:text-[var(--color-muted)]"
                  />
                </div>

                {deferredQuery ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-20 max-h-[28rem] overflow-y-auto rounded-[1.75rem] border border-[var(--color-border)] bg-white p-3 shadow-[0_24px_80px_rgba(39,24,13,0.12)]">
                    {businessSuggestions.length === 0 && productSuggestions.length === 0 ? (
                      <p className="px-3 py-4 text-sm text-[var(--color-muted)]">
                        No encontramos resultados para &quot;{query}&quot;.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {businessSuggestions.length > 0 ? (
                          <div>
                            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                              Locales
                            </p>
                            <div className="space-y-1">
                              {businessSuggestions.map((business) => (
                                <Link
                                  key={business.id}
                                  href={`/locales/${business.slug}`}
                                  className="flex items-center justify-between gap-3 rounded-2xl px-3 py-3 transition hover:bg-[var(--color-surface)]"
                                >
                                  <span className="font-medium text-[var(--color-foreground)]">
                                    {business.name}
                                  </span>
                                  <span className="text-sm text-[var(--color-muted)]">
                                    Ver menú
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {productSuggestions.length > 0 ? (
                          <div>
                            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                              Platos
                            </p>
                            <div className="space-y-1">
                              {productSuggestions.map((product) => (
                                <Link
                                  key={product.id}
                                  href={`/locales/${product.business.slug}`}
                                  className="flex items-center justify-between gap-3 rounded-2xl px-3 py-3 transition hover:bg-[var(--color-surface)]"
                                >
                                  <div>
                                    <p className="font-medium text-[var(--color-foreground)]">
                                      {product.name}
                                    </p>
                                    <p className="text-sm text-[var(--color-muted)]">
                                      {product.business.name}
                                    </p>
                                  </div>
                                  <span className="text-sm font-medium text-[var(--color-foreground)]">
                                    {formatPrice(product.priceAmount, product.currencyCode)}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-16 md:px-10 lg:px-12">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
              Locales con más movimiento
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Encontrá tu próximo pedido para retirar
            </h2>
          </div>
        </div>

        {data.topBusinesses.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {data.topBusinesses.map((business) => {
              const openStatus = getBusinessOpenStatusLabel(business);
              const prepTimeLabel = formatPrepTimeRange(
                business.prepTimeMinMinutes,
                business.prepTimeMaxMinutes
              );
              const cuisineLabel =
                business.cuisineLabels.length > 0
                  ? business.cuisineLabels.join(" · ")
                  : "Menú para retirar";

              return (
                <Link
                  key={business.id}
                  href={`/locales/${business.slug}`}
                  className="group overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-white shadow-[0_20px_60px_rgba(39,24,13,0.06)] transition hover:-translate-y-1"
                >
                  <div className="relative h-40 overflow-hidden bg-[linear-gradient(135deg,#f1dec6_0%,#e9d1b4_100%)]">
                    {business.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={business.coverImageUrl}
                        alt={`Portada de ${business.name}`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                    ) : null}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(32,22,14,0)_0%,rgba(32,22,14,0.64)_100%)]" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-[1.1rem] border border-white/40 bg-white/90">
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
                      <div>
                        <p className="text-lg font-semibold text-white">{business.name}</p>
                        <p className="text-sm text-white/80">
                          {cuisineLabel}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <p className="line-clamp-2 text-sm leading-7 text-[var(--color-muted)]">
                      {business.description ?? business.pickupAddress}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {openStatus ? (
                        <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
                          {openStatus.label}
                        </span>
                      ) : (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          Abierto ahora
                        </span>
                      )}
                      {prepTimeLabel ? (
                        <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-foreground)]">
                          Listo en {prepTimeLabel}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              eyebrow="Sin coincidencias"
              title="No encontramos locales para esa búsqueda"
              description="Probá con otro nombre de local o dejá el buscador vacío para ver los destacados."
            />
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-16 md:px-10 lg:px-12">
        <div className="overflow-hidden rounded-[2.25rem] border border-[var(--color-border)] bg-white shadow-[0_24px_80px_rgba(39,24,13,0.08)]">
          {data.featuredBusiness ? (
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)]">
              <div className="p-8 md:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                  Local destacado
                </p>
                <div className="mt-4 flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface)]">
                    {data.featuredBusiness.profileImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={data.featuredBusiness.profileImageUrl}
                        alt={data.featuredBusiness.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-semibold text-[var(--color-foreground)]">
                        {data.featuredBusiness.name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-4xl font-semibold tracking-tight">
                      {data.featuredBusiness.name}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">
                      {data.featuredBusiness.cuisineLabels.length > 0
                        ? data.featuredBusiness.cuisineLabels.join(" · ")
                        : "Menú para retirar"}
                    </p>
                    <a
                      href={buildGoogleMapsUrl(data.featuredBusiness.pickupAddress)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-sm font-medium text-[var(--color-muted)] underline decoration-[rgba(39,24,13,0.2)] underline-offset-4 transition hover:text-[var(--color-accent)] hover:decoration-[var(--color-accent)]"
                    >
                      {data.featuredBusiness.pickupAddress}
                    </a>
                  </div>
                </div>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-muted)]">
                  {data.featuredBusiness.description ?? data.featuredBusiness.pickupInstructions ?? data.featuredBusiness.pickupAddress}
                </p>
                <div className="mt-8">
                  <Link
                    href={`/locales/${data.featuredBusiness.slug}`}
                    className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95"
                  >
                    Ver menú del local
                  </Link>
                </div>
              </div>

              <div className="relative min-h-[22rem] bg-[linear-gradient(135deg,#c76b32_0%,#8e2e20_100%)]">
                {data.featuredBusiness.coverImageUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={data.featuredBusiness.coverImageUrl}
                      alt={`Portada de ${data.featuredBusiness.name}`}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(32,22,14,0.15)_0%,rgba(32,22,14,0.58)_100%)]" />
                  </>
                ) : null}
                <div className="absolute inset-0 flex items-end p-8 md:p-10">
                  <div className="rounded-[1.75rem] border border-white/20 bg-white/12 p-6 text-white backdrop-blur-sm">
                    <p className="text-sm uppercase tracking-[0.24em] text-white/80">
                      Pick up listo
                    </p>
                    <p className="mt-3 text-2xl font-semibold">
                      Pedí ahora y dejá que la comida te espere a vos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                eyebrow="Sin destacado"
                title="Todavía no hay un local para destacar"
                description="A medida que cargues más negocios activos, esta sección va a mostrar el principal automáticamente."
              />
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-16 md:px-10 lg:px-12">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
              Platos para pedir 
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Productos que están saliendo fuerte
            </h2>
          </div>
        </div>

        {data.featuredProducts.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {data.featuredProducts.map((product) => {
              const hasOffer =
                product.compareAtAmount !== null &&
                product.compareAtAmount > product.priceAmount;

              return (
                <Link
                  key={product.id}
                  href={`/locales/${product.business.slug}`}
                  className="group overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-white shadow-[0_20px_60px_rgba(39,24,13,0.06)] transition hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,#f5e7d4_0%,#efe4d3_50%,#e6d6be_100%)]">
                    {hasOffer ? (
                      <span className="absolute left-4 top-4 z-10 rounded-full bg-[var(--color-accent)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                        Oferta
                      </span>
                    ) : null}
                    {product.image?.publicUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image.publicUrl}
                        alt={product.image.altText ?? product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : null}
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface)]">
                        {product.business.profileImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.business.profileImageUrl}
                            alt={product.business.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-[var(--color-foreground)]">
                            {product.business.name.slice(0, 1).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-[var(--color-muted)]">
                          {product.business.name}
                        </p>
                        <h3 className="text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
                          {product.name}
                        </h3>
                      </div>
                    </div>

                    {product.description ? (
                      <p className="line-clamp-2 text-sm leading-7 text-[var(--color-muted)]">
                        {product.description}
                      </p>
                    ) : null}

                    <div className="flex items-end justify-between gap-4">
                      <div>
                        {hasOffer ? (
                          <p className="text-sm text-[var(--color-muted)] line-through">
                            {formatPrice(product.compareAtAmount!, product.currencyCode)}
                          </p>
                        ) : null}
                        <p className="text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
                          {formatPrice(product.priceAmount, product.currencyCode)}
                        </p>
                      </div>
                      <span className="text-sm text-[var(--color-muted)]">
                        {product.paidUnitsSold > 0
                          ? `${product.paidUnitsSold} vendidos`
                          : "Ver menú"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              eyebrow="Sin coincidencias"
              title="No encontramos productos para esa búsqueda"
              description="Probá con otro plato o dejá el buscador vacío para ver los destacados."
            />
          </div>
        )}
      </section>

      <section className="border-y border-[var(--color-border)] bg-[linear-gradient(135deg,#b34724_0%,#7d2319_100%)] text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-16 md:px-10 lg:px-12">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-white/70">
            Para clientes que no quieren esperar de más
          </p>
          <h2 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
            No esperes más tu comida, que ella te espere a vos.
          </h2>
          <p className="max-w-2xl text-base leading-8 text-white/80">
            Elegí, pagá y pasá a retirar cuando esté pronto. Menos vueltas, más comida lista.
          </p>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm md:px-10 lg:px-12">
        <p className="text-[var(--color-muted)]">
          Restopickup para locales que venden online sin enredar la operación.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/solicitar-acceso"
            className="text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
          >
            ¿Tenés un local? Solicitar acceso
          </Link>
        </div>
      </footer>
    </main>
  );
}
