export type PublicBusiness = {
  id: string;
  name: string;
  slug: string;
  contactPhone: string | null;
  pickupAddress: string;
  pickupInstructions: string | null;
  timezone: string;
  currencyCode: string;
};

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
};

export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceAmount: number;
  compareAtAmount: number | null;
  currencyCode: string;
  position: number;
  categoryId: string | null;
  image: {
    publicUrl: string | null;
    altText: string | null;
  } | null;
};

export type PublicBusinessCatalog = {
  business: PublicBusiness;
  categories: PublicCategory[];
  products: PublicProduct[];
};

export function formatPrice(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
