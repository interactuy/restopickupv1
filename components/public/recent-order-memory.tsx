"use client";

import { useEffect } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { saveRecentPurchaseToAccount } from "@/lib/customer-account-client";
import {
  clearStoredActiveOrder,
  saveStoredActiveOrder,
} from "@/lib/customer-profile";

type RecentOrderMemoryProps = {
  businessId: string;
  businessSlug: string;
  businessName: string;
  orderNumber: number;
  paymentStatus: string;
  statusCode: string;
  placedAt: string;
  estimatedReadyAt: string | null;
  itemSummary: string;
  totalAmount: number;
  currencyCode: string;
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
  statusCode,
  placedAt,
  estimatedReadyAt,
  itemSummary,
  totalAmount,
  currencyCode,
}: RecentOrderMemoryProps) {
  const { clearCart } = useCart();

  useEffect(() => {
    if (!isPurchaseConfirmed(paymentStatus)) {
      return;
    }

    try {
      clearCart(businessId);
      if (["completed", "canceled"].includes(statusCode)) {
        clearStoredActiveOrder();
      } else {
        saveStoredActiveOrder({
          businessSlug,
          businessName,
          orderNumber,
          statusCode,
          placedAt,
          estimatedReadyAt,
          itemSummary,
          totalAmount,
          currencyCode,
        });
      }
      void saveRecentPurchaseToAccount({
        businessId,
        businessSlug,
        businessName,
        orderNumber,
        timestamp: new Date().toISOString(),
        itemSummary,
        totalAmount,
        currencyCode,
      });
    } catch {
      // Ignore local persistence issues for this convenience feature.
    }
  }, [
    businessId,
    businessName,
    businessSlug,
    clearCart,
    currencyCode,
    estimatedReadyAt,
    itemSummary,
    orderNumber,
    paymentStatus,
    placedAt,
    statusCode,
    totalAmount,
  ]);

  return null;
}
