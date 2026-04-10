"use client";

const FUNNEL_SESSION_STORAGE_KEY = "restopickup-funnel-session-id";

export type FunnelEventType =
  | "menu_view"
  | "cart_add"
  | "checkout_started"
  | "order_created"
  | "payment_success";

export function getFunnelSessionId() {
  if (typeof window === "undefined") {
    return null;
  }

  const existingSessionId = window.localStorage.getItem(FUNNEL_SESSION_STORAGE_KEY);

  if (existingSessionId) {
    return existingSessionId;
  }

  const nextSessionId = crypto.randomUUID();
  window.localStorage.setItem(FUNNEL_SESSION_STORAGE_KEY, nextSessionId);
  return nextSessionId;
}

export function trackFunnelEvent(params: {
  eventType: FunnelEventType;
  businessId: string;
  orderId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const sessionId = getFunnelSessionId();

  if (!sessionId) {
    return;
  }

  const payload = {
    eventType: params.eventType,
    businessId: params.businessId,
    orderId: params.orderId ?? null,
    sessionId,
    metadata: params.metadata ?? {},
  };

  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/analytics/funnel",
      new Blob([body], { type: "application/json" })
    );
    return;
  }

  void fetch("/api/analytics/funnel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  });
}
