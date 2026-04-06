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

export type CartLineItem = CartProductSnapshot & {
  quantity: number;
};

export type BusinessCart = {
  businessId: string;
  businessSlug: string;
  businessName: string;
  currencyCode: string;
  items: CartLineItem[];
};

export type CartState = Record<string, BusinessCart>;

export function getCartSubtotal(cart: BusinessCart | null) {
  if (!cart) {
    return 0;
  }

  return cart.items.reduce(
    (total, item) => total + item.priceAmount * item.quantity,
    0
  );
}

export function getCartItemCount(cart: BusinessCart | null) {
  if (!cart) {
    return 0;
  }

  return cart.items.reduce((total, item) => total + item.quantity, 0);
}
