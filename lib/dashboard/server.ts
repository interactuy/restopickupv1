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
  statusCode: string;
  totalAmount: number;
  currencyCode: string;
  paymentStatus: string;
  placedAt: string;
};

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
};

export type DashboardCategory = {
  id: string;
  name: string;
  slug: string;
  position: number;
};

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
      "id, order_number, customer_name, customer_phone, status_code, total_amount, currency_code, payment_status, placed_at"
    )
    .eq("business_id", businessId)
    .order("placed_at", { ascending: false })
    .returns<
      {
        id: string;
        order_number: number;
        customer_name: string;
        customer_phone: string | null;
        status_code: string;
        total_amount: number;
        currency_code: string;
        payment_status: string;
        placed_at: string;
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
    statusCode: order.status_code,
    totalAmount: order.total_amount,
    currencyCode: order.currency_code,
    paymentStatus: order.payment_status,
    placedAt: order.placed_at,
  }));
}

export async function getDashboardProducts(businessId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .select(
      "id, name, slug, description, price_amount, compare_at_amount, currency_code, is_available, position, category_id, category:product_categories(name), product_images(id, storage_path, public_url, alt_text, is_primary, position)"
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
  }));
}

export async function getDashboardCategories(businessId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("product_categories")
    .select("id, name, slug, position")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<
      {
        id: string;
        name: string;
        slug: string;
        position: number;
      }[]
    >();

  if (error) {
    throw new Error(`No se pudieron cargar las categorías: ${error.message}`);
  }

  return (data ?? []).map<DashboardCategory>((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    position: category.position,
  }));
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

  return {
    pendingOrders: orders.filter((order) =>
      ["pending", "confirmed", "preparing"].includes(order.statusCode)
    ).length,
    readyOrders: orders.filter((order) => order.statusCode === "ready_for_pickup")
      .length,
    availableProducts: products.filter((product) => product.isAvailable).length,
    totalProducts: products.length,
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
      href: "/dashboard/productos",
      done: categories.length > 0,
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
