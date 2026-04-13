"use client";

import { useEffect } from "react";

import {
  RECENT_PURCHASES_STORAGE_KEY,
  type RecentPurchaseEntry,
} from "@/lib/customer-profile";

const MAX_RECENT_PURCHASES = 12;

type RecentOrderMemoryProps = {
  businessSlug: string;
  businessName: string;
  orderNumber: number;
  paymentStatus: string;
};

function isPurchaseConfirmed(paymentStatus: string) {
  return paymentStatus === "paid" || paymentStatus === "authorized";
}

export function RecentOrderMemory({
  businessSlug,
  businessName,
  orderNumber,
  paymentStatus,
}: RecentOrderMemoryProps) {
  useEffect(() => {
    if (!isPurchaseConfirmed(paymentStatus)) {
      return;
    }

    try {
      const raw = window.localStorage.getItem(RECENT_PURCHASES_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as RecentPurchaseEntry[]) : [];
      const nextEntry: RecentPurchaseEntry = {
        businessSlug,
        businessName,
        orderNumber,
        timestamp: new Date().toISOString(),
      };

      const nextPurchases = [
        nextEntry,
        ...parsed.filter((entry) => entry.businessSlug !== businessSlug),
      ].slice(0, MAX_RECENT_PURCHASES);

      window.localStorage.setItem(
        RECENT_PURCHASES_STORAGE_KEY,
        JSON.stringify(nextPurchases),
      );
    } catch {
      // Ignore local persistence issues for this convenience feature.
    }
  }, [businessName, businessSlug, orderNumber, paymentStatus]);

  return null;
}
