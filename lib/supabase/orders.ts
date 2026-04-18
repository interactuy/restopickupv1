import "server-only";

import { z } from "zod";

import {
  formatPrice,
  type BusinessHoursEntry,
  type PublicBusiness,
} from "@/lib/public-catalog";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const checkoutSchema = z.object({
  businessSlug: z.string().min(1),
  funnelSessionId: z.string().trim().min(8).max(120).optional().nullable(),
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
  description: string | null;
  contact_phone: string | null;
  contact_action_type: "call" | "whatsapp";
  business_hours_text: string | null;
  is_open_now: boolean;
  business_hours:
    | {
        day: number;
        is_closed: boolean;
        open_time: string | null;
        close_time: string | null;
        intervals?:
          | {
              open_time: string | null;
              close_time: string | null;
            }[]
          | null;
      }[]
    | null;
  is_temporarily_closed: boolean;
  pickup_address: string;
  pickup_instructions: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  currency_code: string;
  prep_time_min_minutes: number | null;
  prep_time_max_minutes: number | null;
  profile_image_url: string | null;
  cover_image_url: string | null;
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

const BUSINESS_DAY_LABELS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

function normalizeBusinessHours(
  rows: BusinessRow["business_hours"]
): BusinessHoursEntry[] {
  const mapped = new Map(
    (rows ?? []).map((entry) => [
      entry.day,
      (() => {
        const intervals = (entry.intervals ?? [])
          .filter(
            (interval) => interval.open_time && interval.close_time
          )
          .map((interval) => ({
            openTime: interval.open_time as string,
            closeTime: interval.close_time as string,
          }));
        const fallbackIntervals =
          intervals.length > 0
            ? intervals
            : entry.open_time && entry.close_time
              ? [{ openTime: entry.open_time, closeTime: entry.close_time }]
              : [];

        return {
        day: entry.day,
        label: BUSINESS_DAY_LABELS[entry.day] ?? `Dia ${entry.day}`,
        isClosed: entry.is_closed,
        openTime: fallbackIntervals[0]?.openTime ?? null,
        closeTime: fallbackIntervals.at(-1)?.closeTime ?? null,
        intervals: fallbackIntervals,
      };
      })(),
    ])
  );

  return Array.from({ length: 7 }, (_, day) => {
    const existing = mapped.get(day);

    return (
      existing ?? {
        day,
        label: BUSINESS_DAY_LABELS[day] ?? `Dia ${day}`,
        isClosed: true,
        openTime: null,
        closeTime: null,
        intervals: [],
      }
    );
  });
}

function getBusinessOpenNow(params: {
  timezone: string;
  hours: BusinessHoursEntry[];
  isTemporarilyClosed: boolean;
}) {
  if (params.isTemporarilyClosed) {
    return false;
  }

  const now = new Date();
  const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: params.timezone,
  });
  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: params.timezone,
  });
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const weekday = weekdayMap[weekdayFormatter.format(now)];
  const currentTime = timeFormatter.format(now);
  const todayHours = params.hours.find((entry) => entry.day === weekday);

  if (!todayHours || todayHours.isClosed || todayHours.intervals.length === 0) {
    return false;
  }

  return todayHours.intervals.some(
    (interval) =>
      currentTime >= interval.openTime && currentTime <= interval.closeTime
  );
}

function mapBusiness(row: BusinessRow): PublicBusiness {
  const businessHours = normalizeBusinessHours(row.business_hours);
  const isOpenNow = getBusinessOpenNow({
    timezone: row.timezone,
    hours: businessHours,
    isTemporarilyClosed: row.is_temporarily_closed,
  });

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    contactPhone: row.contact_phone,
    contactActionType: row.contact_action_type,
    businessHoursText: row.business_hours_text,
    isOpenNow,
    businessHours,
    isTemporarilyClosed: row.is_temporarily_closed,
    pickupAddress: row.pickup_address,
    pickupInstructions: row.pickup_instructions,
    latitude: row.latitude,
    longitude: row.longitude,
    timezone: row.timezone,
    currencyCode: row.currency_code,
    prepTimeMinMinutes: row.prep_time_min_minutes,
    prepTimeMaxMinutes: row.prep_time_max_minutes,
    profileImageUrl: row.profile_image_url,
    coverImageUrl: row.cover_image_url,
  };
}

function buildDefaultEstimatedReadyAt(
  prepTimeMinMinutes: number | null,
  prepTimeMaxMinutes: number | null
) {
  const fallbackMinutes = 25;
  const minutes = prepTimeMaxMinutes ?? prepTimeMinMinutes ?? fallbackMinutes;

  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

export async function createGuestOrder(
  rawInput: CheckoutInput,
  customerUserId?: string | null
): Promise<CreatedGuestOrder> {
  const input = checkoutSchema.parse(rawInput);
  const supabase = createAdminClient();

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select(
      "id, name, slug, description, contact_phone, contact_action_type, business_hours_text, is_open_now, business_hours, is_temporarily_closed, pickup_address, pickup_instructions, latitude, longitude, timezone, currency_code, prep_time_min_minutes, prep_time_max_minutes, profile_image_url, cover_image_url"
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

  const publicBusiness = mapBusiness(business);

  if (publicBusiness.isTemporarilyClosed || !publicBusiness.isOpenNow) {
    throw new Error("Este local no está recibiendo pedidos ahora.");
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
      customer_user_id: customerUserId ?? null,
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
      metadata: {
        funnel_session_id: input.funnelSessionId ?? null,
      },
      estimated_ready_at: buildDefaultEstimatedReadyAt(
        business.prep_time_min_minutes,
        business.prep_time_max_minutes
      ),
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
    business: publicBusiness,
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
      "id, name, slug, description, contact_phone, contact_action_type, business_hours_text, is_open_now, business_hours, is_temporarily_closed, pickup_address, pickup_instructions, latitude, longitude, timezone, currency_code, prep_time_min_minutes, prep_time_max_minutes, profile_image_url, cover_image_url"
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
