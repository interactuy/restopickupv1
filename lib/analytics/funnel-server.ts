import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type FunnelEventType =
  | "menu_view"
  | "cart_add"
  | "checkout_started"
  | "order_created"
  | "payment_success";

export async function recordFunnelEvent(params: {
  eventType: FunnelEventType;
  businessId: string;
  orderId?: string | null;
  sessionId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("platform_funnel_events").insert({
      business_id: params.businessId,
      order_id: params.orderId ?? null,
      event_type: params.eventType,
      session_id: params.sessionId ?? null,
      metadata: params.metadata ?? {},
    });

    if (error) {
      console.warn("[analytics] funnel event insert failed", {
        eventType: params.eventType,
        businessId: params.businessId,
        orderId: params.orderId ?? null,
        error: error.message,
      });
    }
  } catch (error) {
    console.warn("[analytics] funnel event failed", {
      eventType: params.eventType,
      businessId: params.businessId,
      orderId: params.orderId ?? null,
      error: error instanceof Error ? error.message : error,
    });
  }
}
