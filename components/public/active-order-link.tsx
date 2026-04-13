"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  type ActiveCustomerOrder,
  getCustomerActiveOrders,
  getCustomerUser,
} from "@/lib/customer-account-client";
import {
  CUSTOMER_PROFILE_UPDATED_EVENT,
  getStoredActiveOrder,
  saveStoredActiveOrder,
  type StoredActiveOrder,
} from "@/lib/customer-profile";

type HeaderOrder = {
  businessSlug: string;
  businessName: string;
  orderNumber: number;
};

function mapActiveOrderToStored(order: ActiveCustomerOrder): StoredActiveOrder {
  return {
    businessSlug: order.businessSlug,
    businessName: order.businessName,
    orderNumber: order.orderNumber,
    statusCode: order.statusCode,
    estimatedReadyAt: order.estimatedReadyAt,
    placedAt: order.placedAt,
    itemSummary: order.items.map((item) => `${item.quantity}x ${item.productName}`).join(" · "),
    totalAmount: order.totalAmount,
    currencyCode: order.currencyCode,
  };
}

export function ActiveOrderLink() {
  const [activeOrder, setActiveOrder] = useState<HeaderOrder | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function syncActiveOrder() {
      const storedOrder = getStoredActiveOrder();

      if (!cancelled && storedOrder) {
        setActiveOrder({
          businessSlug: storedOrder.businessSlug,
          businessName: storedOrder.businessName,
          orderNumber: storedOrder.orderNumber,
        });
      }

      try {
        const user = await getCustomerUser();

        if (!user) {
          if (!cancelled) {
            setActiveOrder(
              storedOrder
                ? {
                    businessSlug: storedOrder.businessSlug,
                    businessName: storedOrder.businessName,
                    orderNumber: storedOrder.orderNumber,
                  }
                : null,
            );
          }
          return;
        }

        const { activeOrders } = await getCustomerActiveOrders();

        if (cancelled) {
          return;
        }

        if (activeOrders.length > 0) {
          const nextOrder = activeOrders[0];
          saveStoredActiveOrder(mapActiveOrderToStored(nextOrder));
          setActiveOrder({
            businessSlug: nextOrder.businessSlug,
            businessName: nextOrder.businessName,
            orderNumber: nextOrder.orderNumber,
          });
          return;
        }

        if (storedOrder) {
          setActiveOrder({
            businessSlug: storedOrder.businessSlug,
            businessName: storedOrder.businessName,
            orderNumber: storedOrder.orderNumber,
          });
        } else {
          setActiveOrder(null);
        }
      } catch {
        if (!cancelled && storedOrder) {
          setActiveOrder({
            businessSlug: storedOrder.businessSlug,
            businessName: storedOrder.businessName,
            orderNumber: storedOrder.orderNumber,
          });
        }
      }
    }

    syncActiveOrder();
    window.addEventListener(CUSTOMER_PROFILE_UPDATED_EVENT, syncActiveOrder);

    return () => {
      cancelled = true;
      window.removeEventListener(CUSTOMER_PROFILE_UPDATED_EVENT, syncActiveOrder);
    };
  }, []);

  if (!activeOrder) {
    return null;
  }

  return (
    <Link
      href={`/locales/${activeOrder.businessSlug}/pedido/${activeOrder.orderNumber}`}
      className="inline-flex items-center gap-2 rounded-full border border-[rgba(63,92,78,0.2)] bg-[rgba(63,92,78,0.08)] px-3.5 py-2 text-sm font-medium text-[var(--color-secondary)] transition hover:border-[var(--color-secondary)]"
    >
      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-success)]" />
      <span>Pedido en curso</span>
      <span className="hidden text-[var(--color-muted)] sm:inline">·</span>
      <span className="hidden sm:inline">{activeOrder.businessName}</span>
      <span className="text-[var(--color-muted)]">#{activeOrder.orderNumber}</span>
    </Link>
  );
}
