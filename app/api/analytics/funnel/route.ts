import { NextResponse } from "next/server";
import { z } from "zod";

import { recordFunnelEvent } from "@/lib/analytics/funnel-server";

export const runtime = "nodejs";

const funnelEventSchema = z.object({
  eventType: z.enum([
    "menu_view",
    "cart_add",
    "checkout_started",
    "order_created",
    "payment_success",
  ]),
  businessId: z.string().uuid(),
  orderId: z.string().uuid().nullable().optional(),
  sessionId: z.string().trim().min(8).max(120).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  const payload = funnelEventSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await recordFunnelEvent({
    eventType: payload.data.eventType,
    businessId: payload.data.businessId,
    orderId: payload.data.orderId ?? null,
    sessionId: payload.data.sessionId ?? null,
    metadata: payload.data.metadata ?? {},
  });

  return NextResponse.json({ ok: true });
}
