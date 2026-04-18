"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  bootstrapCustomerAccountState,
  getCustomerActiveOrders,
  getCustomerUser,
} from "@/lib/customer-account-client";
import {
  clearStoredActiveOrder,
  getStoredActiveOrder,
  saveStoredActiveOrder,
  type StoredActiveOrder,
} from "@/lib/customer-profile";
import { createClient } from "@/lib/supabase/client";

const READY_NOTICE_PREFIX = "restopickup-ready-order-notice";

function mapActiveOrderToStored(order: Awaited<ReturnType<typeof getCustomerActiveOrders>>["activeOrders"][number]): StoredActiveOrder {
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

export function CustomerSessionBootstrap() {
  const [readyOrderToast, setReadyOrderToast] = useState<{
    businessSlug: string;
    businessName: string;
    orderNumber: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const sync = async () => {
      if (!isMounted) {
        return;
      }

      await bootstrapCustomerAccountState();

      const user = await getCustomerUser();

      if (!isMounted || !user) {
        return;
      }

      try {
        const { activeOrders } = await getCustomerActiveOrders();

        if (!isMounted) {
          return;
        }

        if (activeOrders.length === 0) {
          clearStoredActiveOrder();
          setReadyOrderToast(null);
          return;
        }

        const currentOrder = activeOrders[0];
        const storedActiveOrder = getStoredActiveOrder();
        saveStoredActiveOrder(mapActiveOrderToStored(currentOrder));

        if (currentOrder.statusCode === "ready_for_pickup") {
          const noticeKey = `${READY_NOTICE_PREFIX}:${currentOrder.businessSlug}:${currentOrder.orderNumber}`;
          const alreadyShown =
            typeof window !== "undefined" &&
            window.localStorage.getItem(noticeKey) === "1";

          if (!alreadyShown) {
            if (typeof window !== "undefined") {
              window.localStorage.setItem(noticeKey, "1");
            }

            setReadyOrderToast({
              businessSlug: currentOrder.businessSlug,
              businessName: currentOrder.businessName,
              orderNumber: currentOrder.orderNumber,
            });
          }

          return;
        }

        if (
          storedActiveOrder &&
          storedActiveOrder.orderNumber === currentOrder.orderNumber &&
          storedActiveOrder.statusCode !== currentOrder.statusCode
        ) {
          setReadyOrderToast(null);
        }
      } catch {
        // Ignore transient sync issues for this lightweight customer helper.
      }
    };

    sync();
    const intervalId = window.setInterval(sync, 15000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void sync();
      }

      if (event === "SIGNED_OUT") {
        setReadyOrderToast(null);
      }
    });

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      subscription.unsubscribe();
    };
  }, []);

  return readyOrderToast ? (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center md:inset-x-auto md:right-6 md:bottom-6">
      <div className="pointer-events-auto w-full max-w-md rounded-[1.5rem] border border-[rgba(18,224,138,0.28)] bg-white p-4 shadow-[0_24px_80px_rgba(39,24,13,0.16)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#008F53]">
          Listo para retirar
        </p>
        <p className="mt-2 text-base font-semibold text-[var(--color-foreground)]">
          {readyOrderToast.businessName} ya tiene tu pedido pronto.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/locales/${readyOrderToast.businessSlug}/pedido/${readyOrderToast.orderNumber}`}
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
          >
            Ver pedido
          </Link>
          <button
            type="button"
            onClick={() => setReadyOrderToast(null)}
            className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  ) : null;
}
