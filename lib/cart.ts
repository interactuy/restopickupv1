export type CartProductSnapshot = {
  productId: string;
  name: string;
  slug: string;
  description: string | null;
  priceAmount: number;
  currencyCode: string;
  imageUrl: string | null;
  imageAlt: string | null;
};

export type CartSelectedOptionItem = {
  groupId: string;
  groupName: string;
  itemId: string;
  itemName: string;
  priceDeltaAmount: number;
};

export type CartLineItem = CartProductSnapshot & {
  lineId: string;
  quantity: number;
  unitOptionsAmount: number;
  selectedOptions: CartSelectedOptionItem[];
  customerNote: string | null;
};

export type BusinessCart = {
  businessId: string;
  businessSlug: string;
  businessName: string;
  currencyCode: string;
  items: CartLineItem[];
};

export type CartState = Record<string, BusinessCart>;

export function buildCartLineId(
  productId: string,
  selectedOptionIds: string[],
  customerNote = ""
) {
  const normalizedOptionIds = [...selectedOptionIds].sort().join(",");
  return `${productId}::${normalizedOptionIds}::${customerNote.trim().toLowerCase()}`;
}

export function getCartSubtotal(cart: BusinessCart | null) {
  if (!cart) {
    return 0;
  }

  return cart.items.reduce(
    (total, item) =>
      total + (item.priceAmount + item.unitOptionsAmount) * item.quantity,
    0
  );
}

export function getCartItemCount(cart: BusinessCart | null) {
  if (!cart) {
    return 0;
  }

  return cart.items.reduce((total, item) => total + item.quantity, 0);
}
