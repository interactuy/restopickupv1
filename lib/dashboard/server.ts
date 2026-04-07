import "server-only";

import { redirect } from "next/navigation";

import type { PublicBusiness } from "@/lib/public-catalog";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type BusinessMembershipRow = {
  role: "owner" | "admin" | "staff";
  business: {
    id: string;
    name: string;
    slug: string;
    contact_email: string | null;
    contact_phone: string | null;
    pickup_address: string;
    pickup_instructions: string | null;
    timezone: string;
    currency_code: string;
    is_active: boolean;
    onboarding_completed_at: string | null;
  } | null;
};

export type DashboardContext = {
  user: {
    id: string;
    email: string | null;
  };
  membership: {
    role: "owner" | "admin" | "staff";
  };
  business: PublicBusiness & {
    contactEmail: string | null;
    isActive: boolean;
    onboardingCompletedAt: string | null;
  };
};

export type DashboardOnboardingItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  done: boolean;
};

export type DashboardOrder = {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string | null;
  customerNotes: string | null;
  statusCode: string;
  totalAmount: number;
  currencyCode: string;
  paymentStatus: string;
  placedAt: string;
  estimatedReadyAt: string | null;
  estimatedReadyInMinutes: number;
  items: {
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
  }[];
};

const DELIVERED_ORDER_RETENTION_DAYS = 10;

export type DashboardProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceAmount: number;
  compareAtAmount: number | null;
  currencyCode: string;
  isAvailable: boolean;
  position: number;
  categoryId: string | null;
  categoryName: string | null;
  image: {
    id: string;
    storagePath: string;
    publicUrl: string | null;
    altText: string | null;
  } | null;
  optionGroups: {
    id: string;
    name: string;
    description: string | null;
    selectionType: "single" | "multiple";
    isRequired: boolean;
    minSelect: number;
    maxSelect: number | null;
    position: number;
    items: {
      id: string;
      name: string;
      priceDeltaAmount: number;
      isActive: boolean;
      position: number;
    }[];
  }[];
};

export type DashboardCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
  isActive: boolean;
};

export type DashboardSalesStats = {
  rangeLabel: string;
  totalPaidOrders: number;
  grossRevenueAmount: number;
  averageTicketAmount: number;
  busiestHourLabel: string | null;
  busiestWeekdayLabel: string | null;
  dayHourHeatmap: {
    dayLabel: string;
    hours: {
      hourLabel: string;
      count: number;
    }[];
  }[];
  hourlySales: {
    label: string;
    count: number;
  }[];
  weekdaySales: {
    label: string;
    count: number;
  }[];
  topProducts: {
    name: string;
    quantity: number;
    revenueAmount: number;
  }[];
};

export type DashboardSalesRange = "7d" | "30d" | "all";

function mapBusiness(
  row: NonNullable<BusinessMembershipRow["business"]>
): DashboardContext["business"] {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    pickupAddress: row.pickup_address,
    pickupInstructions: row.pickup_instructions,
    timezone: row.timezone,
    currencyCode: row.currency_code,
    isActive: row.is_active,
    onboardingCompletedAt: row.onboarding_completed_at,
  };
}

export async function getDashboardContext(): Promise<DashboardContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const admin = createAdminClient();
  const { data: memberships, error } = await admin
    .from("business_users")
    .select(
      "role, business:businesses(id, name, slug, contact_email, contact_phone, pickup_address, pickup_instructions, timezone, currency_code, is_active, onboarding_completed_at)"
    )
    .eq("user_id", user.id)
    .returns<BusinessMembershipRow[]>();

  if (error) {
    throw new Error(`No se pudo cargar la membresia: ${error.message}`);
  }

  const membership = memberships?.find((item) => item.business);

  if (!membership?.business) {
    return null;
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    membership: {
      role: membership.role,
    },
    business: mapBusiness(membership.business),
  };
}

export async function requireDashboardContext() {
  const context = await getDashboardContext();

  if (!context) {
    redirect("/login");
  }

  return context;
}

export async function requireCompletedDashboardContext() {
  const context = await requireDashboardContext();

  if (!context.business.onboardingCompletedAt) {
    redirect("/dashboard/onboarding");
  }

  return context;
}

export async function getDashboardOrders(businessId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, customer_notes, status_code, total_amount, currency_code, payment_status, placed_at, estimated_ready_at, order_items(product_name, quantity, unit_price_amount, unit_options_amount, notes, selected_options, line_total_amount)"
    )
    .eq("business_id", businessId)
    .in("payment_status", ["paid", "authorized"])
    .order("placed_at", { ascending: false })
    .returns<
      {
        id: string;
        order_number: number;
        customer_name: string;
        customer_phone: string | null;
        customer_notes: string | null;
        status_code: string;
        total_amount: number;
        currency_code: string;
        payment_status: string;
        placed_at: string;
        estimated_ready_at: string | null;
        order_items: {
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
      }[]
    >();

  if (error) {
    throw new Error(`No se pudieron cargar los pedidos: ${error.message}`);
  }

  return (data ?? []).map<DashboardOrder>((order) => ({
    id: order.id,
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    customerNotes: order.customer_notes,
    statusCode: order.status_code,
    totalAmount: order.total_amount,
    currencyCode: order.currency_code,
    paymentStatus: order.payment_status,
    placedAt: order.placed_at,
    estimatedReadyAt: order.estimated_ready_at,
    estimatedReadyInMinutes: order.estimated_ready_at
      ? Math.max(
          0,
          Math.round(
            (new Date(order.estimated_ready_at).getTime() - Date.now()) / 60000
          )
        )
      : 25,
    items: order.order_items.map((item) => ({
      productName: item.product_name,
      quantity: item.quantity,
      unitPriceAmount: item.unit_price_amount,
      unitOptionsAmount: item.unit_options_amount,
      notes: item.notes,
      selectedOptions: item.selected_options ?? [],
      lineTotalAmount: item.line_total_amount,
    })),
  }));
}

export function getDeliveredOrderRetentionCutoff() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - DELIVERED_ORDER_RETENTION_DAYS);
  return cutoff;
}

export function partitionDashboardOrders(orders: DashboardOrder[]) {
  const deliveredCutoff = getDeliveredOrderRetentionCutoff();

  return {
    pending: orders.filter((order) =>
      ["pending", "confirmed"].includes(order.statusCode)
    ),
    preparing: orders.filter((order) =>
      ["preparing", "ready_for_pickup"].includes(order.statusCode)
    ),
    delivered: orders.filter((order) => {
      if (!["completed", "canceled"].includes(order.statusCode)) {
        return false;
      }

      return new Date(order.placedAt) >= deliveredCutoff;
    }),
  };
}

export async function getDashboardOrderById(
  businessId: string,
  orderId: string
) {
  const orders = await getDashboardOrders(businessId);
  return orders.find((order) => order.id === orderId) ?? null;
}

export async function getDashboardProducts(businessId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .select(
      "id, name, slug, description, price_amount, compare_at_amount, currency_code, is_available, position, category_id, category:product_categories(name), product_option_groups(id, name, description, selection_type, is_required, min_select, max_select, position, product_option_items(id, name, price_delta_amount, is_active, position)), product_images(id, storage_path, public_url, alt_text, is_primary, position)"
    )
    .eq("business_id", businessId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<
      {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        price_amount: number;
        compare_at_amount: number | null;
        currency_code: string;
        is_available: boolean;
        position: number;
        category_id: string | null;
        category: { name: string } | { name: string }[] | null;
        product_option_groups:
          | {
              id: string;
              name: string;
              description: string | null;
              selection_type: "single" | "multiple";
              is_required: boolean;
              min_select: number;
              max_select: number | null;
              position: number;
              product_option_items:
                | {
                    id: string;
                    name: string;
                    price_delta_amount: number;
                    is_active: boolean;
                    position: number;
                  }[]
                | null;
            }[]
          | null;
        product_images:
          | {
              id: string;
              storage_path: string;
              public_url: string | null;
              alt_text: string | null;
              is_primary: boolean;
              position: number;
            }[]
          | null;
      }[]
    >();

  if (error) {
    throw new Error(`No se pudieron cargar los productos: ${error.message}`);
  }

  return (data ?? []).map<DashboardProduct>((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    priceAmount: product.price_amount,
    compareAtAmount: product.compare_at_amount,
    currencyCode: product.currency_code,
    isAvailable: product.is_available,
    position: product.position,
    categoryId: product.category_id,
    categoryName: Array.isArray(product.category)
      ? product.category[0]?.name ?? null
      : product.category?.name ?? null,
    image:
      product.product_images?.find((image) => image.is_primary) ??
      product.product_images?.[0]
        ? {
            id:
              product.product_images?.find((image) => image.is_primary)?.id ??
              product.product_images?.[0]?.id ??
              "",
            storagePath:
              product.product_images?.find((image) => image.is_primary)
                ?.storage_path ??
              product.product_images?.[0]?.storage_path ??
              "",
            publicUrl:
              product.product_images?.find((image) => image.is_primary)
                ?.public_url ??
              product.product_images?.[0]?.public_url ??
              null,
            altText:
              product.product_images?.find((image) => image.is_primary)
                ?.alt_text ??
              product.product_images?.[0]?.alt_text ??
              null,
          }
        : null,
    optionGroups:
      product.product_option_groups
        ?.sort((a, b) => a.position - b.position)
        .map((group) => ({
          id: group.id,
          name: group.name,
          description: group.description,
          selectionType: group.selection_type,
          isRequired: group.is_required,
          minSelect: group.min_select,
          maxSelect: group.max_select,
          position: group.position,
          items:
            group.product_option_items
              ?.sort((a, b) => a.position - b.position)
              .map((item) => ({
                id: item.id,
                name: item.name,
                priceDeltaAmount: item.price_delta_amount,
                isActive: item.is_active,
                position: item.position,
              })) ?? [],
        })) ?? [],
  }));
}

export async function getDashboardCategories(
  businessId: string,
  options?: { activeOnly?: boolean }
) {
  const admin = createAdminClient();
  let query = admin
    .from("product_categories")
    .select("id, name, slug, description, position, is_active")
    .eq("business_id", businessId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query.returns<
    {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      position: number;
      is_active: boolean;
    }[]
  >();

  if (error) {
    throw new Error(`No se pudieron cargar las categorías: ${error.message}`);
  }

  return (data ?? []).map<DashboardCategory>((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    position: category.position,
    isActive: category.is_active,
  }));
}

export async function getDashboardCategoryById(
  businessId: string,
  categoryId: string
) {
  const categories = await getDashboardCategories(businessId);
  return categories.find((category) => category.id === categoryId) ?? null;
}

export async function getDashboardProductById(
  businessId: string,
  productId: string
) {
  const products = await getDashboardProducts(businessId);
  return products.find((product) => product.id === productId) ?? null;
}

export async function getDashboardOverview(businessId: string) {
  const [orders, products] = await Promise.all([
    getDashboardOrders(businessId),
    getDashboardProducts(businessId),
  ]);

  const groupedOrders = partitionDashboardOrders(orders);

  return {
    pendingOrders: groupedOrders.pending.length + groupedOrders.preparing.length,
    readyOrders: orders.filter((order) => order.statusCode === "ready_for_pickup")
      .length,
    availableProducts: products.filter((product) => product.isAvailable).length,
    totalProducts: products.length,
  };
}

export async function getDashboardSalesStats(
  businessId: string,
  timezone = "America/Montevideo",
  range: DashboardSalesRange = "30d"
): Promise<DashboardSalesStats> {
  const orders = await getDashboardOrders(businessId);
  const now = Date.now();
  const rangeMs =
    range === "7d"
      ? 7 * 24 * 60 * 60 * 1000
      : range === "30d"
        ? 30 * 24 * 60 * 60 * 1000
        : null;
  const filteredOrders =
    rangeMs === null
      ? orders
      : orders.filter(
          (order) => now - new Date(order.placedAt).getTime() <= rangeMs
        );

  if (filteredOrders.length === 0) {
    return {
      rangeLabel:
        range === "7d"
          ? "Últimos 7 días"
          : range === "30d"
            ? "Últimos 30 días"
            : "Histórico completo",
      totalPaidOrders: 0,
      grossRevenueAmount: 0,
      averageTicketAmount: 0,
      busiestHourLabel: null,
      busiestWeekdayLabel: null,
      dayHourHeatmap: [],
      hourlySales: [],
      weekdaySales: [],
      topProducts: [],
    };
  }

  const hourFormatter = new Intl.DateTimeFormat("es-UY", {
    hour: "2-digit",
    hourCycle: "h23",
    timeZone: timezone,
  });
  const weekdayKeyFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: timezone,
  });
  const weekdayFormatter = new Intl.DateTimeFormat("es-UY", {
    weekday: "long",
    timeZone: timezone,
  });
  const weekdayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekdayLabelMap: Record<string, string> = {
    Mon: "L",
    Tue: "M",
    Wed: "M",
    Thu: "J",
    Fri: "V",
    Sat: "S",
    Sun: "D",
  };

  const hourCounts = new Map<string, number>();
  const weekdayCounts = new Map<string, number>();
  const dayHourCounts = new Map<string, number>();
  const productStats = new Map<
    string,
    { name: string; quantity: number; revenueAmount: number }
  >();

  let grossRevenueAmount = 0;

  for (const order of filteredOrders) {
    grossRevenueAmount += order.totalAmount;

    const placedAt = new Date(order.placedAt);
    const hourKey = hourFormatter.format(placedAt);
    const weekdayShortKey = weekdayKeyFormatter.format(placedAt);
    const weekdayKey = weekdayFormatter.format(placedAt);

    hourCounts.set(hourKey, (hourCounts.get(hourKey) ?? 0) + 1);
    weekdayCounts.set(weekdayKey, (weekdayCounts.get(weekdayKey) ?? 0) + 1);
    dayHourCounts.set(
      `${weekdayShortKey}-${hourKey}`,
      (dayHourCounts.get(`${weekdayShortKey}-${hourKey}`) ?? 0) + 1
    );

    for (const item of order.items) {
      const existing = productStats.get(item.productName) ?? {
        name: item.productName,
        quantity: 0,
        revenueAmount: 0,
      };

      existing.quantity += item.quantity;
      existing.revenueAmount += item.lineTotalAmount;
      productStats.set(item.productName, existing);
    }
  }

  const busiestHourEntry = [...hourCounts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  )[0];
  const busiestWeekdayEntry = [...weekdayCounts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es")
  )[0];

  return {
    rangeLabel:
      range === "7d"
        ? "Últimos 7 días"
        : range === "30d"
          ? "Últimos 30 días"
          : "Histórico completo",
    totalPaidOrders: filteredOrders.length,
    grossRevenueAmount,
    averageTicketAmount: Math.round(grossRevenueAmount / filteredOrders.length),
    busiestHourLabel: busiestHourEntry ? `${busiestHourEntry[0]}:00` : null,
    busiestWeekdayLabel: busiestWeekdayEntry
      ? busiestWeekdayEntry[0].charAt(0).toUpperCase() + busiestWeekdayEntry[0].slice(1)
      : null,
    dayHourHeatmap: weekdayOrder.map((weekdayShortKey) => ({
      dayLabel: weekdayLabelMap[weekdayShortKey] ?? weekdayShortKey,
      hours: Array.from({ length: 24 }, (_, hour) => {
        const hourKey = String(hour).padStart(2, "0");
        return {
          hourLabel: `${hourKey}:00`,
          count: dayHourCounts.get(`${weekdayShortKey}-${hourKey}`) ?? 0,
        };
      }),
    })),
    hourlySales: [...hourCounts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, count]) => ({
        label: `${label}:00`,
        count,
      })),
    weekdaySales: [...weekdayCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))
      .map(([label, count]) => ({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        count,
      })),
    topProducts: [...productStats.values()]
      .sort((a, b) => b.quantity - a.quantity || b.revenueAmount - a.revenueAmount)
      .slice(0, 5),
  };
}

export async function getDashboardOnboardingItems(
  context: DashboardContext,
): Promise<DashboardOnboardingItem[]> {
  const [categories, products] = await Promise.all([
    getDashboardCategories(context.business.id),
    getDashboardProducts(context.business.id),
  ]);

  return [
    {
      id: "business-details",
      title: "Configurar datos del local",
      description:
        "Revisá el nombre, la dirección de retiro y los datos de contacto visibles para tus clientes.",
      href: "/dashboard/configuracion",
      done: Boolean(
        context.business.name &&
          context.business.pickupAddress &&
          (context.business.contactEmail || context.business.contactPhone),
      ),
    },
    {
      id: "pickup-instructions",
      title: "Cargar instrucciones de retiro",
      description:
        "Sumá una guía corta para que el cliente sepa cómo y dónde retirar su pedido.",
      href: "/dashboard/configuracion",
      done: Boolean(context.business.pickupInstructions?.trim()),
    },
    {
      id: "categories",
      title: "Definir categorías del menú",
      description:
        "Organizá el menú en secciones claras para que después la carga de productos sea más ordenada.",
      href: "/dashboard/categorias",
      done: categories.some((category) => category.isActive),
    },
    {
      id: "products",
      title: "Publicar el primer producto",
      description:
        "Creá al menos un producto con precio, disponibilidad e imagen principal para que la tienda quede lista.",
      href: "/dashboard/productos/nuevo",
      done: products.length > 0,
    },
  ];
}
