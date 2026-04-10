export type PublicBusiness = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  contactPhone: string | null;
  contactActionType: "call" | "whatsapp";
  businessHoursText: string | null;
  isOpenNow: boolean;
  businessHours: BusinessHoursEntry[];
  isTemporarilyClosed: boolean;
  pickupAddress: string;
  pickupInstructions: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  currencyCode: string;
  prepTimeMinMinutes: number | null;
  prepTimeMaxMinutes: number | null;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
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
  optionGroups: PublicProductOptionGroup[];
};

export type PublicProductOptionGroup = {
  id: string;
  name: string;
  description: string | null;
  selectionType: "single" | "multiple";
  isRequired: boolean;
  minSelect: number;
  maxSelect: number | null;
  position: number;
  items: PublicProductOptionItem[];
};

export type PublicProductOptionItem = {
  id: string;
  name: string;
  priceDeltaAmount: number;
  isActive: boolean;
  position: number;
};

export type PublicBusinessCatalog = {
  business: PublicBusiness;
  categories: PublicCategory[];
  products: PublicProduct[];
};

export type HomeBusiness = PublicBusiness & {
  paidOrdersCount: number;
  paidRevenueAmount: number;
  cuisineLabels: string[];
};

export type HomeProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceAmount: number;
  compareAtAmount: number | null;
  currencyCode: string;
  image: {
    publicUrl: string | null;
    altText: string | null;
  } | null;
  business: {
    id: string;
    name: string;
    slug: string;
    profileImageUrl: string | null;
    description: string | null;
    pickupAddress: string;
    latitude: number | null;
    longitude: number | null;
    cuisineLabels: string[];
  };
  paidUnitsSold: number;
};

export type HomePageData = {
  topBusinesses: HomeBusiness[];
  featuredBusiness: HomeBusiness | null;
  featuredProducts: HomeProduct[];
};

export type BusinessHoursEntry = {
  day: number;
  label: string;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
};

export function formatPrepTimeRange(
  minMinutes: number | null,
  maxMinutes: number | null
) {
  if (minMinutes == null && maxMinutes == null) {
    return null;
  }

  if (minMinutes != null && maxMinutes != null) {
    if (minMinutes === maxMinutes) {
      return `${minMinutes} min`;
    }

    return `${minMinutes}-${maxMinutes} min`;
  }

  if (minMinutes != null) {
    return `Desde ${minMinutes} min`;
  }

  return `Hasta ${maxMinutes} min`;
}

function normalizePhoneForWhatsapp(phone: string) {
  return phone.replace(/\D/g, "");
}

export function getBusinessContactAction(business: PublicBusiness) {
  if (!business.contactPhone) {
    return null;
  }

  if (business.contactActionType === "whatsapp") {
    const phone = normalizePhoneForWhatsapp(business.contactPhone);

    return {
      href: `https://wa.me/${phone}`,
      label: "WhatsApp",
    };
  }

  return {
    href: `tel:${business.contactPhone}`,
    label: "Llamar",
  };
}

export function getBusinessOpenStatusLabel(business: PublicBusiness) {
  if (business.isTemporarilyClosed) {
    return {
      label: "Cerrado por hoy",
      tone: "closed" as const,
    };
  }

  if (!business.isOpenNow) {
    return {
      label: "Cerrado por hoy",
      tone: "closed" as const,
    };
  }

  return null;
}

export function getTodayBusinessHoursLabel(business: PublicBusiness) {
  const now = new Date();
  const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: business.timezone,
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
  const today = business.businessHours.find((entry) => entry.day === weekday);

  if (!today || today.isClosed || !today.openTime || !today.closeTime) {
    return "Hoy cerrado";
  }

  return `Hoy ${today.openTime} - ${today.closeTime}`;
}

export function formatPrice(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
