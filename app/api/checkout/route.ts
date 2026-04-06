import { NextResponse } from "next/server";

import { createMercadoPagoPreference } from "@/lib/mercadopago/server";
import { createGuestOrder } from "@/lib/supabase/orders";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const order = await createGuestOrder(payload);
    const preference = await createMercadoPagoPreference({
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

    return NextResponse.json({
      orderId: order.order.id,
      orderNumber: order.order.orderNumber,
      businessSlug: order.business.slug,
      checkoutUrl: preference.checkoutUrl,
      preferenceId: preference.preferenceId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo crear el pedido.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
