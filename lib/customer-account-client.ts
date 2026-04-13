"use client";

import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import {
  CUSTOMER_PROFILE_UPDATED_EVENT,
  type CustomerProfile,
  type FavoriteBusiness,
  type RecentPurchaseEntry,
  getRecentPurchases,
  getStoredCustomerProfile,
  saveRecentPurchases,
  saveStoredCustomerProfile,
} from "@/lib/customer-profile";

type AccountState = {
  user: User;
  profile: CustomerProfile;
  recentPurchases: RecentPurchaseEntry[];
};

function getSiteUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? process.env.APP_URL ?? "";
}

function mergeFavorites(
  serverFavorites: FavoriteBusiness[],
  localFavorites: FavoriteBusiness[],
) {
  const map = new Map<string, FavoriteBusiness>();

  for (const favorite of [...serverFavorites, ...localFavorites]) {
    map.set(favorite.slug, favorite);
  }

  return Array.from(map.values());
}

function mergeRecentPurchases(
  serverEntries: RecentPurchaseEntry[],
  localEntries: RecentPurchaseEntry[],
) {
  const map = new Map<string, RecentPurchaseEntry>();

  for (const entry of [...serverEntries, ...localEntries]) {
    const existing = map.get(entry.businessSlug);

    if (!existing || new Date(entry.timestamp).getTime() > new Date(existing.timestamp).getTime()) {
      map.set(entry.businessSlug, entry);
    }
  }

  return Array.from(map.values())
    .sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 12);
}

export async function getCustomerUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function sendCustomerMagicLink(email: string) {
  const supabase = createClient();
  const redirectTo = `${getSiteUrl()}/auth/callback?next=/cuenta`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    throw error;
  }
}

export async function signOutCustomer() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function bootstrapCustomerAccountState(): Promise<AccountState | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const localProfile = getStoredCustomerProfile();
  const localRecentPurchases = getRecentPurchases();

  await supabase.from("customer_profiles").upsert(
    {
      user_id: user.id,
      full_name: localProfile.name || null,
      phone: localProfile.phone || null,
    },
    {
      onConflict: "user_id",
      ignoreDuplicates: false,
    },
  );

  const [{ data: profileRow }, { data: favoriteRows }, { data: recentRows }] =
    await Promise.all([
      supabase
        .from("customer_profiles")
        .select("full_name, phone")
        .eq("user_id", user.id)
        .maybeSingle<{
          full_name: string | null;
          phone: string | null;
        }>(),
      supabase
        .from("customer_favorite_businesses")
        .select(
          "business_id, business:businesses(id, slug, name, pickup_address, profile_image_url)",
        )
        .eq("user_id", user.id)
        .returns<
          {
            business_id: string;
            business: {
              id: string;
              slug: string;
              name: string;
              pickup_address: string;
              profile_image_url: string | null;
            } | null;
          }[]
        >(),
      supabase
        .from("customer_recent_businesses")
        .select(
          "business_id, last_order_number, last_purchased_at, business:businesses(id, slug, name)",
        )
        .eq("user_id", user.id)
        .order("last_purchased_at", { ascending: false })
        .returns<
          {
            business_id: string;
            last_order_number: number | null;
            last_purchased_at: string;
            business: {
              id: string;
              slug: string;
              name: string;
            } | null;
          }[]
        >(),
    ]);

  const serverFavorites = (favoriteRows ?? [])
    .filter((row) => row.business)
    .map((row) => ({
      businessId: row.business_id,
      slug: row.business!.slug,
      name: row.business!.name,
      pickupAddress: row.business!.pickup_address,
      profileImageUrl: row.business!.profile_image_url,
    }));

  const mergedFavorites = mergeFavorites(serverFavorites, localProfile.favoriteBusinesses);

  if (mergedFavorites.length > 0) {
    await supabase.from("customer_favorite_businesses").upsert(
      mergedFavorites.map((favorite) => ({
        user_id: user.id,
        business_id: favorite.businessId,
      })),
      {
        onConflict: "user_id,business_id",
        ignoreDuplicates: false,
      },
    );
  }

  const serverRecentPurchases = (recentRows ?? [])
    .filter((row) => row.business && row.last_order_number)
    .map((row) => ({
      businessId: row.business_id,
      businessSlug: row.business!.slug,
      businessName: row.business!.name,
      orderNumber: row.last_order_number ?? 0,
      timestamp: row.last_purchased_at,
    }));

  const mergedRecentPurchases = mergeRecentPurchases(
    serverRecentPurchases,
    localRecentPurchases,
  );

  if (mergedRecentPurchases.length > 0) {
    await supabase.from("customer_recent_businesses").upsert(
      mergedRecentPurchases
        .filter((entry) => entry.businessId)
        .map((entry) => ({
          user_id: user.id,
          business_id: entry.businessId,
          last_order_number: entry.orderNumber,
          last_purchased_at: entry.timestamp,
        })),
      {
        onConflict: "user_id,business_id",
        ignoreDuplicates: false,
      },
    );
  }

  const mergedProfile: CustomerProfile = {
    name: profileRow?.full_name ?? localProfile.name,
    phone: profileRow?.phone ?? localProfile.phone,
    favoriteBusinesses: mergedFavorites,
  };

  saveStoredCustomerProfile(mergedProfile);
  saveRecentPurchases(mergedRecentPurchases);

  return {
    user,
    profile: mergedProfile,
    recentPurchases: mergedRecentPurchases,
  };
}

export async function saveCustomerProfileToAccount(profile: CustomerProfile) {
  saveStoredCustomerProfile(profile);

  const user = await getCustomerUser();

  if (!user) {
    return;
  }

  const supabase = createClient();
  const { error } = await supabase.from("customer_profiles").upsert(
    {
      user_id: user.id,
      full_name: profile.name || null,
      phone: profile.phone || null,
    },
    {
      onConflict: "user_id",
      ignoreDuplicates: false,
    },
  );

  if (error) {
    throw error;
  }
}

export async function toggleFavoriteBusinessForAccount(favorite: FavoriteBusiness) {
  const nextProfile = (() => {
    const current = getStoredCustomerProfile();
    const exists = current.favoriteBusinesses.some((item) => item.slug === favorite.slug);

    const next: CustomerProfile = {
      ...current,
      favoriteBusinesses: exists
        ? current.favoriteBusinesses.filter((item) => item.slug !== favorite.slug)
        : [favorite, ...current.favoriteBusinesses].slice(0, 20),
    };

    saveStoredCustomerProfile(next);
    return next;
  })();

  const user = await getCustomerUser();

  if (!user) {
    return nextProfile;
  }

  const supabase = createClient();
  const exists = nextProfile.favoriteBusinesses.some((item) => item.slug === favorite.slug);

  if (exists) {
    const { error } = await supabase.from("customer_favorite_businesses").upsert(
      {
        user_id: user.id,
        business_id: favorite.businessId,
      },
      {
        onConflict: "user_id,business_id",
        ignoreDuplicates: false,
      },
    );

    if (error) {
      throw error;
    }
  } else {
    const { error } = await supabase
      .from("customer_favorite_businesses")
      .delete()
      .eq("user_id", user.id)
      .eq("business_id", favorite.businessId);

    if (error) {
      throw error;
    }
  }

  window.dispatchEvent(new CustomEvent(CUSTOMER_PROFILE_UPDATED_EVENT));

  return nextProfile;
}

export async function saveRecentPurchaseToAccount(entry: RecentPurchaseEntry) {
  const mergedRecentPurchases = mergeRecentPurchases([entry], getRecentPurchases());
  saveRecentPurchases(mergedRecentPurchases);

  const user = await getCustomerUser();

  if (!user || !entry.businessId) {
    return;
  }

  const supabase = createClient();
  const { error } = await supabase.from("customer_recent_businesses").upsert(
    {
      user_id: user.id,
      business_id: entry.businessId,
      last_order_number: entry.orderNumber,
      last_purchased_at: entry.timestamp,
    },
    {
      onConflict: "user_id,business_id",
      ignoreDuplicates: false,
    },
  );

  if (error) {
    throw error;
  }
}
