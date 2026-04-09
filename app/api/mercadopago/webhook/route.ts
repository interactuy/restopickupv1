import { NextRequest, NextResponse } from "next/server";

import {
  syncMercadoPagoPaymentFromWebhook,
  verifyMercadoPagoWebhookSignature,
} from "@/lib/mercadopago/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  let payload: {
    type?: string;
    data?: {
      id?: string | number;
    };
  } = {};

  try {
    payload = rawBody ? (JSON.parse(rawBody) as typeof payload) : {};
  } catch {
    payload = {};
  }

  if (!verifyMercadoPagoWebhookSignature(request)) {
    console.warn("[mercadopago:webhook] invalid signature", {
      requestId: request.headers.get("x-request-id"),
      query: request.nextUrl.search,
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const topic =
    payload.type ??
    request.nextUrl.searchParams.get("type") ??
    request.nextUrl.searchParams.get("topic");
  const paymentId =
    payload.data?.id ??
    request.nextUrl.searchParams.get("data.id") ??
    request.nextUrl.searchParams.get("id");

  if (topic !== "payment" || !paymentId) {
    console.info("[mercadopago:webhook] ignored notification", {
      topic,
      paymentId,
    });
    return NextResponse.json({ received: true });
  }

  console.info("[mercadopago:webhook] syncing payment", {
    paymentId,
    topic,
  });
  await syncMercadoPagoPaymentFromWebhook(paymentId, payload);

  return NextResponse.json({ received: true });
}
