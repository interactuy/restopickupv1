import crypto from "node:crypto";

import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { recordFunnelEvent } from "@/lib/analytics/funnel-server";
import { createMercadoPagoPreference } from "@/lib/mercadopago/server";
import { createGuestOrder } from "@/lib/supabase/orders";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();

  try {
    const payload = await request.json();
    console.info("[checkout] creating order", {
      requestId,
      businessSlug:
        payload && typeof payload === "object" && "businessSlug" in payload
          ? payload.businessSlug
          : null,
      itemsCount:
        payload &&
        typeof payload === "object" &&
        "items" in payload &&
        Array.isArray(payload.items)
          ? payload.items.length
          : null,
    });

    const order = await createGuestOrder(payload);

    console.info("[checkout] order created", {
      requestId,
      orderId: order.order.id,
      orderNumber: order.order.orderNumber,
      businessSlug: order.business.slug,
    });

    await recordFunnelEvent({
      eventType: "order_created",
      businessId: order.business.id,
      orderId: order.order.id,
      sessionId:
        payload && typeof payload === "object" && "funnelSessionId" in payload
          ? String(payload.funnelSessionId ?? "")
          : null,
      metadata: {
        requestId,
        businessSlug: order.business.slug,
        orderNumber: order.order.orderNumber,
      },
    });

    let preference;

    try {
      preference = await createMercadoPagoPreference({
        business: order.business,
        order: {
          id: order.order.id,
          orderNumber: order.order.orderNumber,
          totalAmount: order.order.totalAmount,
          currencyCode: order.order.currencyCode,
          customerName: order.order.customerName,
          customerPhone: order.order.customerPhone,
        },
        items: order.items,
      });
    } catch (error) {
      console.error("[checkout] mercado pago preference failed", {
        requestId,
        orderId: order.order.id,
        orderNumber: order.order.orderNumber,
        businessSlug: order.business.slug,
        error: error instanceof Error ? error.message : error,
      });

      return NextResponse.json(
        {
          error:
            "No pudimos abrir el pago. Probá de nuevo en unos segundos.",
          errorCode: "payment_start_failed",
          orderId: order.order.id,
          orderNumber: order.order.orderNumber,
          requestId,
        },
        { status: 502 }
      );
    }

    console.info("[checkout] preference created", {
      requestId,
      orderId: order.order.id,
      orderNumber: order.order.orderNumber,
      preferenceId: preference.preferenceId,
    });

    return NextResponse.json({
      orderId: order.order.id,
      orderNumber: order.order.orderNumber,
      businessSlug: order.business.slug,
      checkoutUrl: preference.checkoutUrl,
      preferenceId: preference.preferenceId,
      requestId,
    });
  } catch (error) {
    const message =
      error instanceof ZodError
        ? "Revisá los datos del pedido e intentá nuevamente."
        : "No pudimos crear el pedido. Probá de nuevo en unos segundos.";
    const errorCode =
      error instanceof ZodError ? "invalid_checkout_payload" : "order_create_failed";

    console.error("[checkout] failed", {
      requestId,
      error:
        error instanceof ZodError
          ? {
              issues: error.issues,
              flattened: error.flatten(),
            }
          : error instanceof Error
            ? { message: error.message, stack: error.stack }
            : error,
    });

    return NextResponse.json({ error: message, errorCode, requestId }, { status: 400 });
  }
}
