import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ orders: [] });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select(
      "id, order_number, status_code, payment_status, placed_at, estimated_ready_at, business:businesses(name, slug, timezone)"
    )
    .eq("customer_user_id", user.id)
    .in("payment_status", ["paid", "authorized"])
    .not("status_code", "in", "(completed,canceled)")
    .order("placed_at", { ascending: false })
    .returns<
      {
        id: string;
        order_number: number;
        status_code: string;
        payment_status: string;
        placed_at: string;
        estimated_ready_at: string | null;
        business: {
          name: string;
          slug: string;
          timezone: string;
        } | null;
      }[]
    >();

  if (error) {
    return NextResponse.json(
      { error: "No pudimos cargar tus pedidos en curso." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    orders: (data ?? [])
      .filter((order) => order.business)
      .map((order) => ({
        id: order.id,
        orderNumber: order.order_number,
        statusCode: order.status_code,
        paymentStatus: order.payment_status,
        placedAt: order.placed_at,
        estimatedReadyAt: order.estimated_ready_at,
        businessName: order.business!.name,
        businessSlug: order.business!.slug,
        businessTimezone: order.business!.timezone,
      })),
  });
}
