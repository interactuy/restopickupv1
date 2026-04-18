"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type DashboardLiveNotifierProps = {
  businessId: string;
};

type OrderRealtimeRecord = {
  id: string;
  order_number: number | null;
  payment_status: string | null;
};

const VISIBLE_PAYMENT_STATUSES = new Set(["paid", "authorized"]);
const SESSION_STORAGE_KEY = "restopickup-dashboard-seen-orders";

export function DashboardLiveNotifier({
  businessId,
}: DashboardLiveNotifierProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [notification, setNotification] = useState<{
    orderId: string;
    orderNumber: number | null;
  } | null>(null);
  const lastRefreshAtRef = useRef(0);
  const seenOrdersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(SESSION_STORAGE_KEY);

      if (stored) {
        seenOrdersRef.current = new Set(JSON.parse(stored) as string[]);
      }
    } catch {
      seenOrdersRef.current = new Set();
    }
  }, []);

  useEffect(() => {
    function persistSeenOrders() {
      try {
        window.sessionStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify([...seenOrdersRef.current])
        );
      } catch {}
    }

    function refreshDashboard() {
      const now = Date.now();

      if (now - lastRefreshAtRef.current < 3000) {
        return;
      }

      lastRefreshAtRef.current = now;
      router.refresh();
    }

    function handleInsert(record: OrderRealtimeRecord | null) {
      if (!record?.id) {
        return;
      }

      if (VISIBLE_PAYMENT_STATUSES.has(record.payment_status ?? "")) {
        if (!seenOrdersRef.current.has(record.id)) {
          seenOrdersRef.current.add(record.id);
          persistSeenOrders();
          setNotification({
            orderId: record.id,
            orderNumber: record.order_number,
          });
        }
      }

      refreshDashboard();
    }

    function handleUpdate(params: {
      current: OrderRealtimeRecord | null;
      previous: OrderRealtimeRecord | null;
    }) {
      const currentStatus = params.current?.payment_status ?? "";
      const previousStatus = params.previous?.payment_status ?? "";

      if (
        params.current?.id &&
        VISIBLE_PAYMENT_STATUSES.has(currentStatus) &&
        !VISIBLE_PAYMENT_STATUSES.has(previousStatus) &&
        !seenOrdersRef.current.has(params.current.id)
      ) {
        seenOrdersRef.current.add(params.current.id);
        persistSeenOrders();
        setNotification({
          orderId: params.current.id,
          orderNumber: params.current.order_number,
        });
      }

      refreshDashboard();
    }

    const channel = supabase
      .channel(`dashboard-orders-${businessId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => handleInsert(payload.new as OrderRealtimeRecord)
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `business_id=eq.${businessId}`,
        },
        (payload) =>
          handleUpdate({
            current: payload.new as OrderRealtimeRecord,
            previous: payload.old as OrderRealtimeRecord,
          })
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [businessId, router, supabase]);

  if (!notification) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50 w-[min(92vw,380px)] rounded-[1.5rem] border border-[var(--color-border)] bg-white/95 p-4 shadow-[0_24px_80px_rgba(39,24,13,0.22)] backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
        Nuevo pedido
      </p>
      <p className="mt-2 text-base font-semibold text-[var(--color-foreground)]">
        {notification.orderNumber
          ? `Entró el pedido #${notification.orderNumber}`
          : "Entró un nuevo pedido"}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
        El dashboard se actualizó automáticamente para que puedas verlo sin recargar.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/pedidos"
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
        >
          Ver pedidos
        </Link>
        <button
          type="button"
          onClick={() => setNotification(null)}
          className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
