import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type RepeatItem = {
  productId: string;
  name: string;
  slug: string;
  description: string | null;
  priceAmount: number;
  currencyCode: string;
  imageUrl: string | null;
  imageAlt: string | null;
  quantity: number;
  unitOptionsAmount: number;
  customerNote: string | null;
  selectedOptions: {
    groupId: string;
    groupName: string;
    itemId: string;
    itemName: string;
    priceDeltaAmount: number;
  }[];
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Necesitás iniciar sesión." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { orderId?: string } | null;
  const orderId = body?.orderId?.trim();

  if (!orderId) {
    return NextResponse.json({ error: "Falta el pedido a repetir." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: order, error: orderError } = await admin
    .from("orders")
    .select(
      "id, business_id, currency_code, business:businesses(id, slug, name), order_items(product_id, product_name, product_description, quantity, unit_options_amount, notes, selected_options)"
    )
    .eq("id", orderId)
    .eq("customer_user_id", user.id)
    .in("payment_status", ["paid", "authorized"])
    .maybeSingle<{
      id: string;
      business_id: string;
      currency_code: string;
      business: {
        id: string;
        slug: string;
        name: string;
      } | null;
      order_items: {
        product_id: string | null;
        product_name: string;
        product_description: string | null;
        quantity: number;
        unit_options_amount: number;
        notes: string | null;
        selected_options:
          | {
              groupName: string;
              itemName: string;
              priceDeltaAmount: number;
            }[]
          | null;
      }[];
    }>();

  if (orderError || !order || !order.business) {
    return NextResponse.json(
      { error: "No pudimos encontrar ese pedido para repetir." },
      { status: 404 },
    );
  }

  const productIds = order.order_items
    .map((item) => item.product_id)
    .filter((value): value is string => Boolean(value));

  if (productIds.length !== order.order_items.length) {
    return NextResponse.json(
      {
        error:
          "No pudimos repetir este pedido porque algunos productos ya no están disponibles.",
      },
      { status: 409 },
    );
  }

  const { data: products, error: productsError } = await admin
    .from("products")
    .select(
      "id, slug, name, description, price_amount, currency_code, primary_image_url, product_option_groups(id, name, product_option_items(id, name, price_delta_amount, is_active))",
    )
    .eq("business_id", order.business.id)
    .eq("is_available", true)
    .in("id", productIds)
    .returns<
      {
        id: string;
        slug: string;
        name: string;
        description: string | null;
        price_amount: number;
        currency_code: string;
        primary_image_url: string | null;
        product_option_groups:
          | {
              id: string;
              name: string;
              product_option_items:
                | {
                    id: string;
                    name: string;
                    price_delta_amount: number;
                    is_active: boolean;
                  }[]
                | null;
            }[]
          | null;
      }[]
    >();

  if (productsError || !products || products.length !== productIds.length) {
    return NextResponse.json(
      {
        error:
          "No pudimos repetir este pedido porque algunos productos ya no están disponibles.",
      },
      { status: 409 },
    );
  }

  const productsById = new Map(products.map((product) => [product.id, product]));

  const items: RepeatItem[] = [];

  for (const orderItem of order.order_items) {
    const product = productsById.get(orderItem.product_id!);

    if (!product) {
      return NextResponse.json(
        {
          error:
            "No pudimos repetir este pedido porque algunos productos cambiaron.",
        },
        { status: 409 },
      );
    }

    const selectedOptions = (orderItem.selected_options ?? []).map((selectedOption) => {
      const matchingGroup = (product.product_option_groups ?? []).find(
        (group) => group.name === selectedOption.groupName,
      );
      const matchingItem = matchingGroup?.product_option_items?.find(
        (item) =>
          item.is_active &&
          item.name === selectedOption.itemName &&
          item.price_delta_amount === selectedOption.priceDeltaAmount,
      );

      if (!matchingGroup || !matchingItem) {
        return null;
      }

      return {
        groupId: matchingGroup.id,
        groupName: matchingGroup.name,
        itemId: matchingItem.id,
        itemName: matchingItem.name,
        priceDeltaAmount: matchingItem.price_delta_amount,
      };
    });

    if (selectedOptions.some((option) => option === null)) {
      return NextResponse.json(
        {
          error:
            "No pudimos repetir este pedido exactamente porque algunas opciones cambiaron.",
        },
        { status: 409 },
      );
    }

    items.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      priceAmount: product.price_amount,
      currencyCode: product.currency_code,
      imageUrl: product.primary_image_url,
      imageAlt: product.name,
      quantity: orderItem.quantity,
      unitOptionsAmount: orderItem.unit_options_amount,
      customerNote: orderItem.notes,
      selectedOptions: selectedOptions.filter(
        (option): option is NonNullable<typeof option> => Boolean(option),
      ),
    });
  }

  return NextResponse.json({
    business: {
      businessId: order.business.id,
      businessSlug: order.business.slug,
      businessName: order.business.name,
      currencyCode: order.currency_code,
    },
    items,
  });
}
