import "server-only";

import { z } from "zod";

import { formatPrice, type PublicBusiness } from "@/lib/public-catalog";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const checkoutSchema = z.object({
  businessSlug: z.string().min(1),
  customerName: z.string().trim().min(1, "El nombre es obligatorio."),
  customerPhone: z.string().trim().optional().or(z.literal("")),
  customerNotes: z.string().trim().optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
        selectedOptionItemIds: z.array(z.string().uuid()).default([]),
        itemNotes: z
          .string()
          .trim()
          .max(200)
          .optional()
          .nullable()
          .or(z.literal("")),
      })
    )
    .min(1, "El carrito esta vacio."),
});

type CheckoutInput = z.infer<typeof checkoutSchema>;

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  contact_phone: string | null;
  pickup_address: string;
  pickup_instructions: string | null;
  timezone: string;
  currency_code: string;
};

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price_amount: number;
  currency_code: string;
  product_option_groups:
    | {
        id: string;
        name: string;
        selection_type: "single" | "multiple";
        is_required: boolean;
        min_select: number;
        max_select: number | null;
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
};

type OrderInsertRow = {
  id: string;
  order_number: number;
  status_code: string;
  customer_name: string;
  customer_phone: string | null;
  customer_notes: string | null;
  total_amount: number;
  currency_code: string;
  placed_at: string;
  payment_status: string;
  estimated_ready_at: string | null;
};

export type OrderConfirmation = {
  business: PublicBusiness;
  order: {
    id: string;
    orderNumber: number;
    statusCode: string;
    customerName: string;
    customerPhone: string | null;
    customerNotes: string | null;
    totalAmount: number;
    currencyCode: string;
    placedAt: string;
    paymentStatus: string;
    paymentProvider: string | null;
    paymentReference: string | null;
    estimatedReadyAt: string | null;
    pickupAddress: string;
    pickupInstructions: string | null;
    businessName: string;
    contactPhone: string | null;
    items: {
      id: string;
      productName: string;
      quantity: number;
      unitPriceAmount: number;
      unitOptionsAmount: number;
      notes: string | null;
      selectedOptions: {
        groupName: string;
        itemName: string;
        priceDeltaAmount: number;
      }[];
      lineTotalAmount: number;
      formattedUnitPrice: string;
      formattedLineTotal: string;
    }[];
    formattedTotal: string;
  };
};

export type CreatedGuestOrder = {
  business: PublicBusiness;
  order: {
    id: string;
    orderNumber: number;
    statusCode: string;
    customerName: string;
    customerPhone: string | null;
    customerNotes: string | null;
    totalAmount: number;
    formattedTotal: string;
    currencyCode: string;
    placedAt: string;
    paymentStatus: string;
    estimatedReadyAt: string | null;
  };
  items: {
    productId: string;
    productName: string;
    productDescription: string | null;
    quantity: number;
    unitPriceAmount: number;
    unitOptionsAmount: number;
    finalUnitPriceAmount: number;
    notes: string | null;
    selectedOptions: {
      groupName: string;
      itemName: string;
      priceDeltaAmount: number;
    }[];
    lineTotalAmount: number;
  }[];
};

function mapBusiness(row: BusinessRow): PublicBusiness {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    contactPhone: row.contact_phone,
    pickupAddress: row.pickup_address,
    pickupInstructions: row.pickup_instructions,
    timezone: row.timezone,
    currencyCode: row.currency_code,
  };
}

function buildDefaultEstimatedReadyAt() {
  return new Date(Date.now() + 25 * 60 * 1000).toISOString();
}

export async function createGuestOrder(
  rawInput: CheckoutInput
): Promise<CreatedGuestOrder> {
  const input = checkoutSchema.parse(rawInput);
  const supabase = createAdminClient();

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select(
      "id, name, slug, contact_phone, pickup_address, pickup_instructions, timezone, currency_code"
    )
    .eq("slug", input.businessSlug)
    .eq("is_active", true)
    .maybeSingle<BusinessRow>();

  if (businessError) {
    throw new Error(`No se pudo validar el local: ${businessError.message}`);
  }

  if (!business) {
    throw new Error("El local no existe o no esta disponible.");
  }

  const normalizedItems = Object.values(
    input.items.reduce<
      Record<
        string,
        {
          productId: string;
          quantity: number;
          selectedOptionItemIds: string[];
          itemNotes: string | null;
        }
      >
    >(
      (accumulator, item) => {
        const normalizedNotes = item.itemNotes?.trim() || null;
        const key = `${item.productId}:${[...item.selectedOptionItemIds].sort().join(",")}:${normalizedNotes ?? ""}`;
        const existing = accumulator[key];

        accumulator[key] = {
          productId: item.productId,
          quantity: (existing?.quantity ?? 0) + item.quantity,
          selectedOptionItemIds: [...item.selectedOptionItemIds].sort(),
          itemNotes: normalizedNotes,
        };

        return accumulator;
      },
      {}
    )
  );

  const productIds = normalizedItems.map((item) => item.productId);

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      "id, name, description, price_amount, currency_code, product_option_groups(id, name, selection_type, is_required, min_select, max_select, product_option_items(id, name, price_delta_amount, is_active))"
    )
    .eq("business_id", business.id)
    .eq("is_available", true)
    .in("id", productIds)
    .returns<ProductRow[]>();

  if (productsError) {
    throw new Error(`No se pudieron validar los productos: ${productsError.message}`);
  }

  if (!products || products.length !== productIds.length) {
    throw new Error(
      "Uno o mas productos del carrito ya no estan disponibles. Actualiza el carrito e intenta otra vez."
    );
  }

  const productsById = new Map(products.map((product) => [product.id, product]));

  const orderItems = normalizedItems.map((item) => {
    const product = productsById.get(item.productId);

    if (!product) {
      throw new Error("Hay productos invalidos en el carrito.");
    }

    const selectedOptionItems = new Map<
      string,
      { groupName: string; itemName: string; priceDeltaAmount: number }
    >();

    for (const group of product.product_option_groups ?? []) {
      const groupItems = group.product_option_items ?? [];
      const chosenItems = groupItems.filter((groupItem) =>
        item.selectedOptionItemIds.includes(groupItem.id)
      );

      if (group.is_required && chosenItems.length < Math.max(1, group.min_select)) {
        throw new Error(`Falta elegir una opción obligatoria para ${product.name}.`);
      }

      if (group.max_select !== null && chosenItems.length > group.max_select) {
        throw new Error(`Hay demasiadas opciones elegidas para ${product.name}.`);
      }

      for (const chosenItem of chosenItems) {
        if (!chosenItem.is_active) {
          throw new Error(`Una opción elegida para ${product.name} ya no está disponible.`);
        }

        selectedOptionItems.set(chosenItem.id, {
          groupName: group.name,
          itemName: chosenItem.name,
          priceDeltaAmount: chosenItem.price_delta_amount,
        });
      }
    }

    if (selectedOptionItems.size !== item.selectedOptionItemIds.length) {
      throw new Error(`Hay opciones inválidas en ${product.name}.`);
    }

    const selectedOptions = item.selectedOptionItemIds.map((optionId) => {
      const selectedOption = selectedOptionItems.get(optionId);

      if (!selectedOption) {
        throw new Error(`Hay opciones inválidas en ${product.name}.`);
      }

      return selectedOption;
    });

    const unitOptionsAmount = selectedOptions.reduce(
      (total, selectedOption) => total + selectedOption.priceDeltaAmount,
      0
    );
    const finalUnitPriceAmount = product.price_amount + unitOptionsAmount;

    return {
      productId: product.id,
      productName: product.name,
      productDescription: product.description,
      quantity: item.quantity,
      unitPriceAmount: product.price_amount,
      unitOptionsAmount,
      finalUnitPriceAmount,
      notes: item.itemNotes,
      selectedOptions,
      lineTotalAmount: finalUnitPriceAmount * item.quantity,
    };
  });

  const subtotal = orderItems.reduce(
    (total, item) => total + item.lineTotalAmount,
    0
  );

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      business_id: business.id,
      status_code: "pending",
      fulfillment_type: "pickup",
      customer_name: input.customerName.trim(),
      customer_phone: input.customerPhone?.trim() || null,
      customer_notes: input.customerNotes?.trim() || null,
      currency_code: business.currency_code,
      subtotal_amount: subtotal,
      discount_amount: 0,
      total_amount: subtotal,
      payment_status: "pending",
      estimated_ready_at: buildDefaultEstimatedReadyAt(),
    })
    .select(
      "id, order_number, status_code, customer_name, customer_phone, customer_notes, total_amount, currency_code, placed_at, payment_status, estimated_ready_at"
    )
    .single<OrderInsertRow>();

  if (orderError) {
    throw new Error(`No se pudo crear el pedido: ${orderError.message}`);
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    orderItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_description: item.productDescription,
      quantity: item.quantity,
      unit_price_amount: item.unitPriceAmount,
      unit_options_amount: item.unitOptionsAmount,
      selected_options: item.selectedOptions,
      notes: item.notes,
    }))
  );

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    throw new Error(`No se pudieron guardar los items: ${itemsError.message}`);
  }

  return {
    business: mapBusiness(business),
    order: {
      id: order.id,
      orderNumber: order.order_number,
      statusCode: order.status_code,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerNotes: order.customer_notes,
      totalAmount: order.total_amount,
      formattedTotal: formatPrice(order.total_amount, order.currency_code),
      currencyCode: order.currency_code,
      placedAt: order.placed_at,
      paymentStatus: order.payment_status,
      estimatedReadyAt: order.estimated_ready_at,
    },
    items: orderItems,
  };
}

export async function getOrderConfirmation(
  businessSlug: string,
  orderNumber: number
): Promise<OrderConfirmation | null> {
  const supabase = await createClient();

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select(
      "id, name, slug, contact_phone, pickup_address, pickup_instructions, timezone, currency_code"
    )
    .eq("slug", businessSlug)
    .eq("is_active", true)
    .maybeSingle<BusinessRow>();

  if (businessError) {
    throw new Error(
      `No se pudo cargar el local del pedido: ${businessError.message}`
    );
  }

  if (!business) {
    return null;
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, order_number, status_code, customer_name, customer_phone, customer_notes, total_amount, currency_code, placed_at, payment_status, payment_provider, payment_reference, estimated_ready_at, order_items(id, product_name, quantity, unit_price_amount, unit_options_amount, notes, selected_options, line_total_amount)"
    )
    .eq("business_id", business.id)
    .eq("order_number", orderNumber)
    .single<{
      id: string;
      order_number: number;
      status_code: string;
      customer_name: string;
      customer_phone: string | null;
      customer_notes: string | null;
      total_amount: number;
      currency_code: string;
      placed_at: string;
      payment_status: string;
      payment_provider: string | null;
      payment_reference: string | null;
      estimated_ready_at: string | null;
      order_items: {
        id: string;
        product_name: string;
        quantity: number;
        unit_price_amount: number;
        unit_options_amount: number;
        notes: string | null;
        selected_options:
          | {
              groupName: string;
              itemName: string;
              priceDeltaAmount: number;
            }[]
          | null;
        line_total_amount: number;
      }[];
    }>();

  if (orderError) {
    if (orderError.code === "PGRST116") {
      return null;
    }

    throw new Error(`No se pudo cargar el pedido: ${orderError.message}`);
  }

  return {
    business: mapBusiness(business),
    order: {
      id: order.id,
      orderNumber: order.order_number,
      statusCode: order.status_code,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerNotes: order.customer_notes,
      totalAmount: order.total_amount,
      currencyCode: order.currency_code,
      placedAt: order.placed_at,
      paymentStatus: order.payment_status,
      paymentProvider: order.payment_provider,
      paymentReference: order.payment_reference,
      estimatedReadyAt: order.estimated_ready_at,
      pickupAddress: business.pickup_address,
      pickupInstructions: business.pickup_instructions,
      businessName: business.name,
      contactPhone: business.contact_phone,
      items: order.order_items.map((item) => ({
        id: item.id,
        productName: item.product_name,
        quantity: item.quantity,
        unitPriceAmount: item.unit_price_amount,
        unitOptionsAmount: item.unit_options_amount,
        notes: item.notes,
        selectedOptions: item.selected_options ?? [],
        lineTotalAmount: item.line_total_amount,
        formattedUnitPrice: formatPrice(
          item.unit_price_amount + item.unit_options_amount,
          order.currency_code
        ),
        formattedLineTotal: formatPrice(item.line_total_amount, order.currency_code),
      })),
      formattedTotal: formatPrice(order.total_amount, order.currency_code),
    },
  };
}
