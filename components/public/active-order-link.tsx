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
  statusCode: string;
};

const statusLabelMap: Record<string, string> = {
  pending: "Recibido",
  confirmed: "Confirmado",
  preparing: "En preparación",
  ready_for_pickup: "Listo para retirar",
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
          statusCode: storedOrder.statusCode,
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
                    statusCode: storedOrder.statusCode,
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
            statusCode: nextOrder.statusCode,
          });
          return;
        }

        if (storedOrder) {
          setActiveOrder({
            businessSlug: storedOrder.businessSlug,
            businessName: storedOrder.businessName,
            orderNumber: storedOrder.orderNumber,
            statusCode: storedOrder.statusCode,
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
            statusCode: storedOrder.statusCode,
          });
        }
      }
    }

    syncActiveOrder();
    const intervalId = window.setInterval(syncActiveOrder, 15000);
    window.addEventListener(CUSTOMER_PROFILE_UPDATED_EVENT, syncActiveOrder);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener(CUSTOMER_PROFILE_UPDATED_EVENT, syncActiveOrder);
    };
  }, []);

  if (!activeOrder) {
    return null;
  }

  const statusLabel =
    statusLabelMap[activeOrder.statusCode] ??
    (activeOrder.statusCode === "completed" ? "Retirado" : "Pedido en curso");
  const isReady = activeOrder.statusCode === "ready_for_pickup";

  return (
    <Link
      href={`/locales/${activeOrder.businessSlug}/pedido/${activeOrder.orderNumber}`}
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition ${
        isReady
          ? "border border-[rgba(18,224,138,0.28)] bg-[rgba(18,224,138,0.16)] text-[#008F53] hover:border-[#12E08A]"
          : "border border-[rgba(63,92,78,0.2)] bg-[rgba(63,92,78,0.08)] text-[var(--color-secondary)] hover:border-[var(--color-secondary)]"
      }`}
    >
      <span
        className={`inline-flex h-2.5 w-2.5 rounded-full ${
          isReady ? "bg-[#12E08A]" : "bg-[var(--color-success)]"
        }`}
      />
      <span>{statusLabel}</span>
      <span className="hidden text-[var(--color-muted)] sm:inline">·</span>
      <span className="hidden sm:inline">{activeOrder.businessName}</span>
      <span className="text-[var(--color-muted)]">#{activeOrder.orderNumber}</span>
    </Link>
  );
}
