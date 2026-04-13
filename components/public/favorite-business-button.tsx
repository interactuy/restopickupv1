"use client";

import { useEffect, useState } from "react";

import {
  CUSTOMER_PROFILE_UPDATED_EVENT,
  getStoredCustomerProfile,
  type FavoriteBusiness,
} from "@/lib/customer-profile";
import { toggleFavoriteBusinessForAccount } from "@/lib/customer-account-client";

type FavoriteBusinessButtonProps = {
  favorite: FavoriteBusiness;
};

export function FavoriteBusinessButton({ favorite }: FavoriteBusinessButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    function syncFavoriteState() {
      const profile = getStoredCustomerProfile();
      setIsFavorite(profile.favoriteBusinesses.some((item) => item.slug === favorite.slug));
    }

    syncFavoriteState();
    window.addEventListener(CUSTOMER_PROFILE_UPDATED_EVENT, syncFavoriteState);

    return () => {
      window.removeEventListener(CUSTOMER_PROFILE_UPDATED_EVENT, syncFavoriteState);
    };
  }, [favorite.slug]);

  async function handleToggle() {
    const nextProfile = await toggleFavoriteBusinessForAccount(favorite);
    setIsFavorite(nextProfile.favoriteBusinesses.some((item) => item.slug === favorite.slug));
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
        isFavorite
          ? "border-[rgba(198,90,46,0.24)] bg-[rgba(198,90,46,0.08)] text-[var(--color-accent)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      }`}
      aria-pressed={isFavorite}
    >
      <span aria-hidden="true">{isFavorite ? "♥" : "♡"}</span>
      {isFavorite ? "Favorito" : "Guardar"}
    </button>
  );
}
