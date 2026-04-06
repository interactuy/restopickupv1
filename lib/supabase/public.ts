import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  PublicBusiness,
  PublicBusinessCatalog,
  PublicCategory,
  PublicProduct,
} from "@/lib/public-catalog";

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

type CategoryRow = {
  id: string;
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
  };
}

export async function getFeaturedBusiness() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("businesses")
    .select(
      "id, name, slug, contact_phone, pickup_address, pickup_instructions, timezone, currency_code"
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

export async function getPublicBusinessCatalog(
  slug: string
): Promise<PublicBusinessCatalog | null> {
  const supabase = await createClient();

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select(
      "id, name, slug, contact_phone, pickup_address, pickup_instructions, timezone, currency_code"
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
          "id, name, slug, description, price_amount, compare_at_amount, currency_code, position, category_id, product_images(public_url, alt_text, position, is_primary)"
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
