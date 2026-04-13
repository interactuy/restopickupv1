export const CUSTOMER_PROFILE_STORAGE_KEY = "restopickup-customer-profile";
export const CUSTOMER_LOCATION_STORAGE_KEY = "restopickup-customer-location";
export const RECENT_PURCHASES_STORAGE_KEY = "restopickup-recent-purchases";
export const CUSTOMER_PROFILE_UPDATED_EVENT = "restopickup-customer-profile-updated";

export type CustomerProfile = {
  name: string;
  phone: string;
  favoriteBusinesses: FavoriteBusiness[];
};

export type FavoriteBusiness = {
  businessId: string;
  slug: string;
  name: string;
  pickupAddress: string;
  profileImageUrl: string | null;
};

export type StoredCustomerLocation = {
  latitude: number;
  longitude: number;
  savedAt: string;
};

export type RecentPurchaseEntry = {
  businessId: string | null;
  businessSlug: string;
  businessName: string;
  orderNumber: number;
  timestamp: string;
};

const DEFAULT_PROFILE: CustomerProfile = {
  name: "",
  phone: "",
  favoriteBusinesses: [],
};

function canUseStorage() {
  return typeof window !== "undefined";
}

function emitCustomerProfileUpdated() {
  if (!canUseStorage()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(CUSTOMER_PROFILE_UPDATED_EVENT));
}

export function getStoredCustomerProfile(): CustomerProfile {
  if (!canUseStorage()) {
    return DEFAULT_PROFILE;
  }

  try {
    const raw = window.localStorage.getItem(CUSTOMER_PROFILE_STORAGE_KEY);

    if (!raw) {
      return DEFAULT_PROFILE;
    }

    const parsed = JSON.parse(raw) as Partial<CustomerProfile>;

    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      favoriteBusinesses: Array.isArray(parsed.favoriteBusinesses)
        ? parsed.favoriteBusinesses.filter(
            (item): item is FavoriteBusiness =>
              Boolean(item) &&
              typeof item.businessId === "string" &&
              typeof item.slug === "string" &&
              typeof item.name === "string" &&
              typeof item.pickupAddress === "string",
          )
        : [],
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveStoredCustomerProfile(profile: CustomerProfile) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(CUSTOMER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  emitCustomerProfileUpdated();
}

export function clearStoredCustomerProfile() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(CUSTOMER_PROFILE_STORAGE_KEY);
  emitCustomerProfileUpdated();
}

export function toggleFavoriteBusiness(favorite: FavoriteBusiness) {
  const current = getStoredCustomerProfile();
  const exists = current.favoriteBusinesses.some((item) => item.slug === favorite.slug);

  const nextProfile: CustomerProfile = {
    ...current,
    favoriteBusinesses: exists
      ? current.favoriteBusinesses.filter((item) => item.slug !== favorite.slug)
      : [favorite, ...current.favoriteBusinesses].slice(0, 20),
  };

  saveStoredCustomerProfile(nextProfile);

  return nextProfile;
}

export function getStoredCustomerLocation(): StoredCustomerLocation | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(CUSTOMER_LOCATION_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<StoredCustomerLocation>;

    if (
      typeof parsed.latitude !== "number" ||
      typeof parsed.longitude !== "number" ||
      typeof parsed.savedAt !== "string"
    ) {
      return null;
    }

    return {
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}

export function saveStoredCustomerLocation(location: StoredCustomerLocation) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(CUSTOMER_LOCATION_STORAGE_KEY, JSON.stringify(location));
  emitCustomerProfileUpdated();
}

export function getRecentPurchases(): RecentPurchaseEntry[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RECENT_PURCHASES_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as RecentPurchaseEntry[];
    return Array.isArray(parsed)
      ? parsed.filter(
          (entry): entry is RecentPurchaseEntry =>
            Boolean(entry) &&
            (typeof entry.businessId === "string" || entry.businessId === null) &&
            typeof entry.businessSlug === "string" &&
            typeof entry.businessName === "string" &&
            typeof entry.orderNumber === "number" &&
            typeof entry.timestamp === "string",
        )
      : [];
  } catch {
    return [];
  }
}

export function saveRecentPurchases(entries: RecentPurchaseEntry[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(RECENT_PURCHASES_STORAGE_KEY, JSON.stringify(entries));
  emitCustomerProfileUpdated();
}

export function upsertRecentPurchase(entry: RecentPurchaseEntry, maxEntries = 12) {
  const current = getRecentPurchases();
  const nextEntries = [
    entry,
    ...current.filter((item) => item.businessSlug !== entry.businessSlug),
  ].slice(0, maxEntries);

  saveRecentPurchases(nextEntries);

  return nextEntries;
}
