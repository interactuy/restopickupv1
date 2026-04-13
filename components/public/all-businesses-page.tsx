"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { CustomerAccountLink } from "@/components/public/customer-account-link";
import { CustomerSessionBootstrap } from "@/components/public/customer-session-bootstrap";
import type { HomeBusiness, HomePageData } from "@/lib/public-catalog";
import {
  formatPrepTimeRange,
  getBusinessOpenStatusLabel,
} from "@/lib/public-catalog";
import {
  CUSTOMER_PROFILE_UPDATED_EVENT,
  CUSTOMER_PROFILE_STORAGE_KEY,
  CUSTOMER_LOCATION_STORAGE_KEY,
  RECENT_PURCHASES_STORAGE_KEY,
  getStoredCustomerLocation,
  getStoredCustomerProfile,
  type RecentPurchaseEntry,
  saveStoredCustomerLocation,
} from "@/lib/customer-profile";

type AllBusinessesPageProps = {
  data: HomePageData;
};

type UserLocation = {
  latitude: number;
  longitude: number;
};

type LocationStatus = "idle" | "loading" | "ready" | "denied" | "unsupported";
type LocalesFilter = "all" | "open" | "nearby" | `cuisine:${string}`;

function normalizeFilterValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getDistanceKm(
  from: UserLocation,
  to: { latitude: number | null; longitude: number | null },
) {
  if (to.latitude == null || to.longitude == null) {
    return null;
  }

  const earthRadiusKm = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const originLatitude = toRadians(from.latitude);
  const targetLatitude = toRadians(to.latitude);
  const a =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(originLatitude) *
      Math.cos(targetLatitude) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getDaypart() {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 11) {
    return "morning";
  }

  if (hour >= 15 && hour < 18) {
    return "afternoon";
  }

  if ((hour >= 11 && hour < 15) || hour >= 18 || hour < 2) {
    return "meal";
  }

  return "any";
}

function getDaypartScore(values: string[], daypart: ReturnType<typeof getDaypart>) {
  const haystack = values.join(" ").toLowerCase();
  const breakfastKeywords = [
    "café",
    "cafe",
    "cafetería",
    "cafeteria",
    "desayuno",
    "brunch",
    "panadería",
    "panaderia",
    "pastelería",
    "pasteleria",
    "medialuna",
    "merienda",
  ];
  const mealKeywords = [
    "burger",
    "hamburguesa",
    "pizza",
    "pizzería",
    "pizzeria",
    "wrap",
    "sandwich",
    "sushi",
    "milanesa",
    "almuerzo",
    "cena",
    "comida",
    "taco",
    "pollo",
    "carne",
    "pasta",
  ];
  const keywords =
    daypart === "morning" || daypart === "afternoon"
      ? breakfastKeywords
      : daypart === "meal"
        ? mealKeywords
        : [];

  if (keywords.length === 0) {
    return 0;
  }

  return keywords.some((keyword) => haystack.includes(keyword)) ? 1 : 0;
}

function getRecentPurchaseBusinessSlugs() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RECENT_PURCHASES_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as RecentPurchaseEntry[];

    return parsed
      .map((entry) => entry.businessSlug)
      .filter((value, index, array) => Boolean(value) && array.indexOf(value) === index);
  } catch {
    return [];
  }
}

function BusinessCard({
  business,
  distanceKm,
}: {
  business: HomeBusiness;
  distanceKm: number | null;
}) {
  const prepTimeLabel = formatPrepTimeRange(
    business.prepTimeMinMinutes,
    business.prepTimeMaxMinutes,
  );
  const openStatus = getBusinessOpenStatusLabel(business);
  const cuisineLabel =
    business.cuisineLabels.length > 0
      ? business.cuisineLabels.join(" · ")
      : "Menú para retirar";

  return (
    <Link
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
            <p className="text-sm text-white/80">{cuisineLabel}</p>
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
          {distanceKm !== null ? (
            <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-muted)]">
              {distanceKm < 1
                ? `${Math.round(distanceKm * 1000)} m`
                : `${distanceKm.toFixed(1)} km`}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function AllBusinessesPage({ data }: AllBusinessesPageProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [selectedFilter, setSelectedFilter] = useState<LocalesFilter>("all");
  const daypart = getDaypart();
  const customerStorageSnapshot = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      window.addEventListener(CUSTOMER_PROFILE_UPDATED_EVENT, onStoreChange);

      return () => {
        window.removeEventListener(CUSTOMER_PROFILE_UPDATED_EVENT, onStoreChange);
      };
    },
    () => {
      if (typeof window === "undefined") {
        return "";
      }

      return [
        window.localStorage.getItem(CUSTOMER_PROFILE_STORAGE_KEY) ?? "",
        window.localStorage.getItem(CUSTOMER_LOCATION_STORAGE_KEY) ?? "",
        window.localStorage.getItem(RECENT_PURCHASES_STORAGE_KEY) ?? "",
      ].join("|");
    },
    () => "",
  );
  const storedLocation = getStoredCustomerLocation();
  const recentPurchaseSlugs = getRecentPurchaseBusinessSlugs();
  const favoriteSlugs = getStoredCustomerProfile().favoriteBusinesses.map((favorite) => favorite.slug);
  const effectiveUserLocation = useMemo(
    () =>
      userLocation ??
      (storedLocation
        ? {
            latitude: storedLocation.latitude,
            longitude: storedLocation.longitude,
          }
        : null),
    [storedLocation, userLocation],
  );
  const effectiveLocationStatus =
    locationStatus === "idle" && storedLocation ? "ready" : locationStatus;

  useEffect(() => {
    void customerStorageSnapshot;
  }, [customerStorageSnapshot]);

  function requestUserLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      return;
    }

    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(nextLocation);
        saveStoredCustomerLocation({
          ...nextLocation,
          savedAt: new Date().toISOString(),
        });
        setLocationStatus("ready");
      },
      () => {
        setLocationStatus("denied");
      },
      {
        enableHighAccuracy: false,
        maximumAge: 1000 * 60 * 20,
        timeout: 8000,
      },
    );
  }

  useEffect(() => {
    if (!navigator.permissions || !navigator.geolocation) {
      return;
    }

    navigator.permissions
      .query({ name: "geolocation" })
      .then((permission) => {
        if (permission.state === "granted") {
          requestUserLocation();
        }
      })
      .catch(() => {
        // Some browsers expose geolocation permissions inconsistently.
      });
  }, []);

  const orderedBusinesses = useMemo(() => {
    return [...data.topBusinesses]
      .map((business, index) => {
        const distanceKm = effectiveUserLocation
          ? getDistanceKm(effectiveUserLocation, business)
          : null;
        const hasRecentPurchase = recentPurchaseSlugs.includes(business.slug);
        const daypartScore = getDaypartScore(
          [
            business.name,
            business.description ?? "",
            business.pickupAddress,
            ...business.cuisineLabels,
          ],
          daypart,
        );
        const openStatus = getBusinessOpenStatusLabel(business);
        const isOpen = openStatus === null;
        const distanceScore =
          distanceKm === null ? 0 : Math.max(0, 1 - Math.min(distanceKm, 12) / 12);
        const salesScore =
          business.paidOrdersCount > 0 ? Math.min(1.25, business.paidOrdersCount / 20) : 0;
        const repeatScore = hasRecentPurchase ? 3.2 : 0;
        const openScore = isOpen ? 2.5 : -4.5;

        return {
          business,
          distanceKm,
          score:
            daypartScore * 12 +
            (effectiveUserLocation ? distanceScore * 6 : 0) +
            repeatScore +
            openScore +
            salesScore -
            index * 0.001,
        };
      })
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        if (a.distanceKm !== null && b.distanceKm !== null) {
          return a.distanceKm - b.distanceKm;
        }

        return 0;
      });
  }, [data.topBusinesses, daypart, effectiveUserLocation, recentPurchaseSlugs]);

  const favoriteBusinesses = orderedBusinesses.filter((entry) =>
    favoriteSlugs.includes(entry.business.slug),
  );
  const repeatBusinesses = orderedBusinesses.filter((entry) =>
    recentPurchaseSlugs.includes(entry.business.slug),
  );
  const availableCuisineFilters = useMemo(() => {
    const seen = new Set<string>();

    return orderedBusinesses
      .flatMap(({ business }) => business.cuisineLabels)
      .filter((label) => {
        const normalized = normalizeFilterValue(label);

        if (!normalized || seen.has(normalized)) {
          return false;
        }

        seen.add(normalized);
        return true;
      })
      .slice(0, 6);
  }, [orderedBusinesses]);
  const filteredBusinesses = useMemo(() => {
    return orderedBusinesses.filter(({ business, distanceKm }) => {
      if (selectedFilter === "all") {
        return true;
      }

      if (selectedFilter === "open") {
        return getBusinessOpenStatusLabel(business) === null;
      }

      if (selectedFilter === "nearby") {
        return distanceKm !== null && distanceKm <= 4;
      }

      if (selectedFilter.startsWith("cuisine:")) {
        const cuisine = selectedFilter.slice("cuisine:".length);

        return business.cuisineLabels.some(
          (label) => normalizeFilterValue(label) === cuisine,
        );
      }

      return true;
    });
  }, [orderedBusinesses, selectedFilter]);
  const locationButtonLabel =
    effectiveLocationStatus === "loading"
      ? "Buscando..."
      : effectiveLocationStatus === "ready"
        ? "Cerca mío"
        : effectiveLocationStatus === "unsupported"
          ? "Sin ubicación"
          : "Cerca mío";

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <CustomerSessionBootstrap />

      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 md:px-10 lg:px-12">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/" className="text-lg font-semibold tracking-tight">
                Restopickup
              </Link>
              <span className="hidden text-sm text-[var(--color-muted)] md:inline">
                Todos los locales
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/"
                className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
              >
                Inicio
              </Link>
              <CustomerAccountLink />
            </div>
          </header>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                Locales
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
                Todos los locales en un solo lugar.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)] md:text-base md:leading-8">
                Priorizados para mostrar primero lo que más te conviene pedir ahora.
              </p>
            </div>

            <button
              type="button"
              onClick={requestUserLocation}
              disabled={effectiveLocationStatus === "loading"}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                effectiveLocationStatus === "ready"
                  ? "bg-[rgba(47,122,74,0.1)] text-[var(--color-success)]"
                  : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  effectiveLocationStatus === "ready"
                    ? "bg-[var(--color-success)]"
                    : "bg-[var(--color-accent)]"
                }`}
              />
              {locationButtonLabel}
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-10 md:px-10 lg:px-12">
        {favoriteBusinesses.length > 0 ? (
          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                  Tus favoritos
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  Locales que guardaste
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {favoriteBusinesses.map(({ business, distanceKm }) => (
                <BusinessCard key={`favorite-${business.id}`} business={business} distanceKm={distanceKm} />
              ))}
            </div>
          </div>
        ) : null}

        {repeatBusinesses.length > 0 ? (
          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                  Volvé a pedir
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  Locales donde ya compraste
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {repeatBusinesses.map(({ business, distanceKm }) => (
                <BusinessCard key={`repeat-${business.id}`} business={business} distanceKm={distanceKm} />
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                Todos los locales
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                {effectiveUserLocation ? "Ordenados para este momento" : "Explorá todos los locales"}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {filteredBusinesses.length} {filteredBusinesses.length === 1 ? "local" : "locales"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedFilter("all")}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                selectedFilter === "all"
                  ? "border-[var(--color-accent)] bg-[rgba(198,90,46,0.1)] text-[var(--color-accent)]"
                  : "border-[var(--color-border)] bg-white text-[var(--color-foreground)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter("open")}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                selectedFilter === "open"
                  ? "border-[var(--color-accent)] bg-[rgba(198,90,46,0.1)] text-[var(--color-accent)]"
                  : "border-[var(--color-border)] bg-white text-[var(--color-foreground)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              }`}
            >
              Abiertos ahora
            </button>
            {effectiveUserLocation ? (
              <button
                type="button"
                onClick={() => setSelectedFilter("nearby")}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  selectedFilter === "nearby"
                    ? "border-[var(--color-accent)] bg-[rgba(198,90,46,0.1)] text-[var(--color-accent)]"
                    : "border-[var(--color-border)] bg-white text-[var(--color-foreground)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                }`}
              >
                Cerca tuyo
              </button>
            ) : null}
            {availableCuisineFilters.map((label) => {
              const value = `cuisine:${normalizeFilterValue(label)}` as LocalesFilter;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelectedFilter(value)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    selectedFilter === value
                      ? "border-[var(--color-accent)] bg-[rgba(198,90,46,0.1)] text-[var(--color-accent)]"
                      : "border-[var(--color-border)] bg-white text-[var(--color-foreground)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {filteredBusinesses.length > 0 ? (
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredBusinesses.map(({ business, distanceKm }) => (
                <BusinessCard key={business.id} business={business} distanceKm={distanceKm} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[1.75rem] border border-dashed border-[var(--color-border)] bg-white p-6 text-sm leading-7 text-[var(--color-muted)]">
              No encontramos locales para ese filtro.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
