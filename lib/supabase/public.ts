import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  BusinessHoursEntry,
  HomeBusiness,
  HomePageData,
  HomeProduct,
  PublicBusiness,
  PublicBusinessCatalog,
  PublicCategory,
  PublicProduct,
  PublicProductOptionGroup,
  PublicProductOptionItem,
} from "@/lib/public-catalog";

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

type CategoryRow = {
  id: string;
  business_id?: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
};

type ProductImageRow = {
  public_url: string | null;
  alt_text: string | null;
  position: number;
  is_primary: boolean;
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_amount: number;
  compare_at_amount: number | null;
  currency_code: string;
  position: number;
  category_id: string | null;
  product_images: ProductImageRow[] | null;
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
};

type HomeOrderRow = {
  id: string;
  business_id: string;
  total_amount: number;
};

type HomeOrderItemRow = {
  product_id: string | null;
  quantity: number;
};

const BUSINESS_DAY_LABELS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

function normalizeBusinessHours(
  rows: BusinessRow["business_hours"]
): BusinessHoursEntry[] {
  const mapped = new Map(
    (rows ?? []).map((entry) => [
      entry.day,
      {
        day: entry.day,
        label: BUSINESS_DAY_LABELS[entry.day] ?? `Dia ${entry.day}`,
        isClosed: entry.is_closed,
        openTime: entry.open_time,
        closeTime: entry.close_time,
      },
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

  if (
    !todayHours ||
    todayHours.isClosed ||
    !todayHours.openTime ||
    !todayHours.closeTime
  ) {
    return false;
  }

  return (
    currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime
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

function mapCategory(row: CategoryRow): PublicCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    position: row.position,
  };
}

function mapProduct(row: ProductRow): PublicProduct {
  const primaryImage =
    row.product_images?.find((image) => image.is_primary) ??
    row.product_images?.sort((a, b) => a.position - b.position)[0] ??
    null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    priceAmount: row.price_amount,
    compareAtAmount: row.compare_at_amount,
    currencyCode: row.currency_code,
    position: row.position,
    categoryId: row.category_id,
    image: primaryImage
      ? {
          publicUrl: primaryImage.public_url,
          altText: primaryImage.alt_text,
        }
      : null,
    optionGroups:
      row.product_option_groups
        ?.sort((a, b) => a.position - b.position)
        .map<PublicProductOptionGroup>((group) => ({
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
              .map<PublicProductOptionItem>((item) => ({
                id: item.id,
                name: item.name,
                priceDeltaAmount: item.price_delta_amount,
                isActive: item.is_active,
                position: item.position,
              }))
              .filter((item) => item.isActive) ?? [],
        }))
        .filter((group) => group.items.length > 0) ?? [],
  };
}

function mapHomeProduct(params: {
  row: ProductRow;
  business: PublicBusiness;
  paidUnitsSold: number;
  cuisineLabels: string[];
}): HomeProduct {
  const primaryImage =
    params.row.product_images?.find((image) => image.is_primary) ??
    params.row.product_images?.sort((a, b) => a.position - b.position)[0] ??
    null;

  return {
    id: params.row.id,
    name: params.row.name,
    slug: params.row.slug,
    description: params.row.description,
    priceAmount: params.row.price_amount,
    compareAtAmount: params.row.compare_at_amount,
    currencyCode: params.row.currency_code,
    image: primaryImage
      ? {
          publicUrl: primaryImage.public_url,
          altText: primaryImage.alt_text,
        }
      : null,
    business: {
      id: params.business.id,
      name: params.business.name,
      slug: params.business.slug,
      profileImageUrl: params.business.profileImageUrl,
      description: params.business.description,
      pickupAddress: params.business.pickupAddress,
      latitude: params.business.latitude,
      longitude: params.business.longitude,
      cuisineLabels: params.cuisineLabels,
    },
    paidUnitsSold: params.paidUnitsSold,
  };
}

export async function getFeaturedBusiness() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("businesses")
    .select(
      "id, name, slug, description, contact_phone, contact_action_type, business_hours_text, is_open_now, business_hours, is_temporarily_closed, pickup_address, pickup_instructions, latitude, longitude, timezone, currency_code, prep_time_min_minutes, prep_time_max_minutes, profile_image_url, cover_image_url"
    )
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<BusinessRow>();

  if (error) {
    throw new Error(`No se pudo cargar el negocio destacado: ${error.message}`);
  }

  return data ? mapBusiness(data) : null;
}

export async function getHomePageData(): Promise<HomePageData> {
  const supabase = await createClient();

  const [{ data: businesses, error: businessesError }, { data: paidOrders, error: ordersError }, { data: products, error: productsError }, { data: categories, error: categoriesError }] =
    await Promise.all([
      supabase
        .from("businesses")
        .select(
          "id, name, slug, description, contact_phone, contact_action_type, business_hours_text, is_open_now, business_hours, is_temporarily_closed, pickup_address, pickup_instructions, latitude, longitude, timezone, currency_code, prep_time_min_minutes, prep_time_max_minutes, profile_image_url, cover_image_url, created_at"
        )
        .eq("is_active", true)
        .order("created_at", { ascending: true })
        .returns<(BusinessRow & { created_at: string })[]>(),
      supabase
        .from("orders")
        .select("id, business_id, total_amount")
        .in("payment_status", ["authorized", "paid"])
        .returns<HomeOrderRow[]>(),
      supabase
        .from("products")
        .select(
          "id, name, slug, description, price_amount, compare_at_amount, currency_code, position, category_id, business_id, created_at, product_images(public_url, alt_text, position, is_primary), product_option_groups(id, name, description, selection_type, is_required, min_select, max_select, position, product_option_items(id, name, price_delta_amount, is_active, position))"
        )
        .eq("is_available", true)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true })
        .returns<(ProductRow & { business_id: string; created_at: string })[]>(),
      supabase
        .from("product_categories")
        .select("id, business_id, name, slug, description, position")
        .eq("is_active", true)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true })
        .returns<(CategoryRow & { business_id: string })[]>(),
    ]);

  if (businessesError) {
    throw new Error(`No se pudieron cargar los locales de la home: ${businessesError.message}`);
  }

  if (ordersError) {
    throw new Error(`No se pudieron cargar las ventas de la home: ${ordersError.message}`);
  }

  if (productsError) {
    throw new Error(`No se pudieron cargar los productos de la home: ${productsError.message}`);
  }

  if (categoriesError) {
    throw new Error(`No se pudieron cargar las categorías de la home: ${categoriesError.message}`);
  }

  const activeBusinesses = (businesses ?? []).map((row) => ({
    ...mapBusiness(row),
    createdAt: row.created_at,
  }));
  const businessMap = new Map(activeBusinesses.map((business) => [business.id, business]));

  const orderStatsByBusiness = new Map<string, { count: number; revenue: number }>();
  for (const order of paidOrders ?? []) {
    const current = orderStatsByBusiness.get(order.business_id) ?? { count: 0, revenue: 0 };
    current.count += 1;
    current.revenue += order.total_amount;
    orderStatsByBusiness.set(order.business_id, current);
  }

  const categoryNamesByBusiness = new Map<string, string[]>();
  for (const category of categories ?? []) {
    const current = categoryNamesByBusiness.get(category.business_id) ?? [];
    if (!current.includes(category.name)) {
      current.push(category.name);
    }
    categoryNamesByBusiness.set(category.business_id, current);
  }

  const topBusinesses = activeBusinesses
    .map<HomeBusiness>((business) => {
      const stats = orderStatsByBusiness.get(business.id) ?? { count: 0, revenue: 0 };
      const cuisineLabels = (categoryNamesByBusiness.get(business.id) ?? []).slice(0, 2);

      return {
        ...business,
        paidOrdersCount: stats.count,
        paidRevenueAmount: stats.revenue,
        cuisineLabels,
      };
    })
    .sort((a, b) => {
      if (b.paidOrdersCount !== a.paidOrdersCount) {
        return b.paidOrdersCount - a.paidOrdersCount;
      }

      if (b.paidRevenueAmount !== a.paidRevenueAmount) {
        return b.paidRevenueAmount - a.paidRevenueAmount;
      }

      return activeBusinesses.findIndex((item) => item.id === a.id) -
        activeBusinesses.findIndex((item) => item.id === b.id);
    })
    .slice(0, 24);

  const paidOrderIds = (paidOrders ?? []).map((order) => order.id);
  let paidUnitsByProduct = new Map<string, number>();

  if (paidOrderIds.length > 0) {
    const { data: paidOrderItems, error: orderItemsError } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .in("order_id", paidOrderIds)
      .returns<HomeOrderItemRow[]>();

    if (orderItemsError) {
      throw new Error(`No se pudieron cargar los items vendidos para la home: ${orderItemsError.message}`);
    }

    paidUnitsByProduct = new Map<string, number>();
    for (const item of paidOrderItems ?? []) {
      if (!item.product_id) {
        continue;
      }

      paidUnitsByProduct.set(
        item.product_id,
        (paidUnitsByProduct.get(item.product_id) ?? 0) + item.quantity
      );
    }
  }

  const featuredProducts = (products ?? [])
    .filter((product) => businessMap.has(product.business_id))
    .map((product, index) => ({
      row: product,
      business: businessMap.get(product.business_id)!,
      paidUnitsSold: paidUnitsByProduct.get(product.id) ?? 0,
      fallbackOrder: index,
    }))
    .sort((a, b) => {
      if (b.paidUnitsSold !== a.paidUnitsSold) {
        return b.paidUnitsSold - a.paidUnitsSold;
      }

      return a.fallbackOrder - b.fallbackOrder;
    })
    .slice(0, 36)
    .map((entry) =>
      mapHomeProduct({
        row: entry.row,
        business: entry.business,
        paidUnitsSold: entry.paidUnitsSold,
        cuisineLabels: categoryNamesByBusiness.get(entry.business.id) ?? [],
      })
    );

  return {
    topBusinesses,
    featuredBusiness: topBusinesses[0] ?? null,
    featuredProducts,
  };
}

export async function getPublicBusinessCatalog(
  slug: string
): Promise<PublicBusinessCatalog | null> {
  const supabase = await createClient();

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select(
      "id, name, slug, description, contact_phone, contact_action_type, business_hours_text, is_open_now, business_hours, is_temporarily_closed, pickup_address, pickup_instructions, latitude, longitude, timezone, currency_code, prep_time_min_minutes, prep_time_max_minutes, profile_image_url, cover_image_url"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle<BusinessRow>();

  if (businessError) {
    throw new Error(
      `No se pudo cargar el negocio "${slug}": ${businessError.message}`
    );
  }

  if (!business) {
    return null;
  }

  const [{ data: categories, error: categoriesError }, { data: products, error: productsError }] =
    await Promise.all([
      supabase
        .from("product_categories")
        .select("id, name, slug, description, position")
        .eq("business_id", business.id)
        .eq("is_active", true)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true })
        .returns<CategoryRow[]>(),
      supabase
        .from("products")
        .select(
          "id, name, slug, description, price_amount, compare_at_amount, currency_code, position, category_id, product_images(public_url, alt_text, position, is_primary), product_option_groups(id, name, description, selection_type, is_required, min_select, max_select, position, product_option_items(id, name, price_delta_amount, is_active, position))"
        )
        .eq("business_id", business.id)
        .eq("is_available", true)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true })
        .returns<ProductRow[]>(),
    ]);

  if (categoriesError) {
    throw new Error(
      `No se pudieron cargar las categorias del negocio "${slug}": ${categoriesError.message}`
    );
  }

  if (productsError) {
    throw new Error(
      `No se pudieron cargar los productos del negocio "${slug}": ${productsError.message}`
    );
  }

  return {
    business: mapBusiness(business),
    categories: (categories ?? []).map(mapCategory),
    products: (products ?? []).map(mapProduct),
  };
}
