"use client";

import { useEffect } from "react";

import { saveRecentPurchaseToAccount } from "@/lib/customer-account-client";

type RecentOrderMemoryProps = {
  businessId: string;
  businessSlug: string;
  businessName: string;
  orderNumber: number;
  paymentStatus: string;
};

function isPurchaseConfirmed(paymentStatus: string) {
  return paymentStatus === "paid" || paymentStatus === "authorized";
}

export function RecentOrderMemory({
  businessId,
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
      void saveRecentPurchaseToAccount({
        businessId,
        businessSlug,
        businessName,
        orderNumber,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Ignore local persistence issues for this convenience feature.
    }
  }, [businessId, businessName, businessSlug, orderNumber, paymentStatus]);

  return null;
}
