import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
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
  contact_phone: string | null;
  pickup_address: string;
  pickup_instructions: string | null;
  timezone: string;
  currency_code: string;
  profile_image_url: string | null;
  cover_image_url: string | null;
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

export async function getFeaturedBusiness() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("businesses")
    .select(
      "id, name, slug, contact_phone, pickup_address, pickup_instructions, timezone, currency_code, profile_image_url, cover_image_url"
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
      "id, name, slug, contact_phone, pickup_address, pickup_instructions, timezone, currency_code, profile_image_url, cover_image_url"
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
