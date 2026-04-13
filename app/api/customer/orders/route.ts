import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ activeOrders: [], previousOrders: [] });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select(
      "id, order_number, status_code, payment_status, total_amount, currency_code, placed_at, estimated_ready_at, order_items(product_name, quantity), business:businesses(name, slug, timezone)"
    )
    .eq("customer_user_id", user.id)
    .in("payment_status", ["paid", "authorized"])
    .order("placed_at", { ascending: false })
    .returns<
      {
        id: string;
        order_number: number;
        status_code: string;
        payment_status: string;
        total_amount: number;
        currency_code: string;
        placed_at: string;
        estimated_ready_at: string | null;
        order_items: {
          product_name: string;
          quantity: number;
        }[];
        business: {
          name: string;
          slug: string;
          timezone: string;
        } | null;
      }[]
    >();

  if (error) {
    return NextResponse.json(
      { error: "No pudimos cargar tus pedidos." },
      { status: 500 }
    );
  }

  const orders = (data ?? [])
    .filter((order) => order.business)
    .map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      statusCode: order.status_code,
      paymentStatus: order.payment_status,
      totalAmount: order.total_amount,
      currencyCode: order.currency_code,
      placedAt: order.placed_at,
      estimatedReadyAt: order.estimated_ready_at,
      businessName: order.business!.name,
      businessSlug: order.business!.slug,
      businessTimezone: order.business!.timezone,
      items: order.order_items.map((item) => ({
        productName: item.product_name,
        quantity: item.quantity,
      })),
    }));

  return NextResponse.json({
    activeOrders: orders.filter(
      (order) => !["completed", "canceled"].includes(order.statusCode)
    ),
    previousOrders: orders
      .filter((order) => ["completed", "canceled"].includes(order.statusCode))
      .slice(0, 12),
  });
}
