"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { BusinessCart, CartLineItem, CartProductSnapshot, CartState } from "@/lib/cart";
import { getCartItemCount, getCartSubtotal } from "@/lib/cart";

const STORAGE_KEY = "restopickup-cart-v1";

type BusinessCartDescriptor = {
  businessId: string;
  businessSlug: string;
  businessName: string;
  currencyCode: string;
};

type CartContextValue = {
  isReady: boolean;
  getCart: (businessId: string) => BusinessCart | null;
  addItem: (
    business: BusinessCartDescriptor,
    product: CartProductSnapshot,
    quantity?: number
  ) => void;
  updateQuantity: (businessId: string, productId: string, quantity: number) => void;
  removeItem: (businessId: string, productId: string) => void;
  clearCart: (businessId: string) => void;
  getItemCount: (businessId: string) => number;
  getSubtotal: (businessId: string) => number;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCarts(): CartState {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as CartState;
  } catch {
    return {};
  }
}

type CartProviderProps = {
  children: ReactNode;
};

export function CartProvider({ children }: CartProviderProps) {
  const [carts, setCarts] = useState<CartState>(() => readStoredCarts());
  const isReady = true;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(carts));
  }, [carts]);

  function getCart(businessId: string) {
    return carts[businessId] ?? null;
  }

  function addItem(
    business: BusinessCartDescriptor,
    product: CartProductSnapshot,
    quantity = 1
  ) {
    setCarts((current) => {
      const existingCart = current[business.businessId];
      const existingItems = existingCart?.items ?? [];
      const existingItem = existingItems.find(
        (item) => item.productId === product.productId
      );

      let items: CartLineItem[];

      if (existingItem) {
        items = existingItems.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        items = [...existingItems, { ...product, quantity }];
      }

      return {
        ...current,
        [business.businessId]: {
          businessId: business.businessId,
          businessSlug: business.businessSlug,
          businessName: business.businessName,
          currencyCode: business.currencyCode,
          items,
        },
      };
    });
  }

  function updateQuantity(
    businessId: string,
    productId: string,
    quantity: number
  ) {
    setCarts((current) => {
      const cart = current[businessId];

      if (!cart) {
        return current;
      }

      const nextItems = cart.items
        .map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
        .filter((item) => item.quantity > 0);

      if (nextItems.length === 0) {
        const next = { ...current };
        delete next[businessId];
        return next;
      }

      return {
        ...current,
        [businessId]: {
          ...cart,
          items: nextItems,
        },
      };
    });
  }

  function removeItem(businessId: string, productId: string) {
    updateQuantity(businessId, productId, 0);
  }

  function clearCart(businessId: string) {
    setCarts((current) => {
      if (!current[businessId]) {
        return current;
      }

      const next = { ...current };
      delete next[businessId];
      return next;
    });
  }

  function getItemCount(businessId: string) {
    return getCartItemCount(carts[businessId] ?? null);
  }

  function getSubtotal(businessId: string) {
    return getCartSubtotal(carts[businessId] ?? null);
  }

  return (
    <CartContext.Provider
      value={{
        isReady,
        getCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        getItemCount,
        getSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider.");
  }

  return context;
}
