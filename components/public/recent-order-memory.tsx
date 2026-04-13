"use client";

import { useEffect } from "react";

import { useCart } from "@/components/cart/cart-provider";
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
  const { clearCart } = useCart();

  useEffect(() => {
    if (!isPurchaseConfirmed(paymentStatus)) {
      return;
    }

    try {
      clearCart(businessId);
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
  }, [businessId, businessName, businessSlug, clearCart, orderNumber, paymentStatus]);

  return null;
}
