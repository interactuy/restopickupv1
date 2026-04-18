"use client";

import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  BusinessCart,
  CartLineItem,
  CartProductSnapshot,
  CartSelectedOptionItem,
  CartState,
} from "@/lib/cart";
import { getCartItemCount, getCartSubtotal } from "@/lib/cart";
import type { PublicProduct } from "@/lib/public-catalog";

const STORAGE_KEY = "restopickup-cart-v2";

type BusinessCartDescriptor = {
  businessId: string;
  businessSlug: string;
  businessName: string;
  currencyCode: string;
};

type CartContextValue = {
  isReady: boolean;
  getCart: (businessId: string) => BusinessCart | null;
  replaceCart: (business: BusinessCartDescriptor, items: CartLineItem[]) => void;
  reconcileCart: (
    business: BusinessCartDescriptor,
    products: PublicProduct[]
  ) => void;
  addItem: (
    business: BusinessCartDescriptor,
    product: CartProductSnapshot,
    lineId: string,
    selectedOptions?: CartLineItem["selectedOptions"],
    unitOptionsAmount?: number,
    customerNote?: string | null,
    quantity?: number
  ) => void;
  updateQuantity: (businessId: string, lineId: string, quantity: number) => void;
  removeItem: (businessId: string, lineId: string) => void;
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
    lineId: string,
    selectedOptions: CartLineItem["selectedOptions"] = [],
    unitOptionsAmount = 0,
    customerNote: string | null = null,
    quantity = 1
  ) {
    setCarts((current) => {
      const existingCart = current[business.businessId];
      const existingItems = existingCart?.items ?? [];
      const existingItem = existingItems.find((item) => item.lineId === lineId);

      let items: CartLineItem[];

      if (existingItem) {
        items = existingItems.map((item) =>
          item.lineId === lineId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        items = [
          ...existingItems,
          {
            ...product,
            lineId,
            quantity,
            selectedOptions,
            unitOptionsAmount,
            customerNote,
          },
        ];
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

  function replaceCart(business: BusinessCartDescriptor, items: CartLineItem[]) {
    setCarts((current) => ({
      ...current,
      [business.businessId]: {
        businessId: business.businessId,
        businessSlug: business.businessSlug,
        businessName: business.businessName,
        currencyCode: business.currencyCode,
        items,
      },
    }));
  }

  const reconcileCart = useCallback(function reconcileCart(
    business: BusinessCartDescriptor,
    products: PublicProduct[]
  ) {
    setCarts((current) => {
      const existingCart = current[business.businessId];

      if (!existingCart) {
        return current;
      }

      const productsById = new Map(products.map((product) => [product.id, product]));
      let hasChanges =
        existingCart.businessSlug !== business.businessSlug ||
        existingCart.businessName !== business.businessName ||
        existingCart.currencyCode !== business.currencyCode;

      const nextItems = existingCart.items.flatMap<CartLineItem>((item) => {
        const product = productsById.get(item.productId);

        if (!product) {
          hasChanges = true;
          return [];
        }

        const selectedItemIds = item.selectedOptions.map((option) => option.itemId);
        const selectedOptionsById = new Map<string, CartSelectedOptionItem>();

        for (const group of product.optionGroups) {
          const chosenItems = group.items.filter((groupItem) =>
            selectedItemIds.includes(groupItem.id)
          );

          if (group.isRequired && chosenItems.length < Math.max(1, group.minSelect)) {
            hasChanges = true;
            return [];
          }

          if (group.maxSelect !== null && chosenItems.length > group.maxSelect) {
            hasChanges = true;
            return [];
          }

          for (const chosenItem of chosenItems) {
            selectedOptionsById.set(chosenItem.id, {
              groupId: group.id,
              groupName: group.name,
              itemId: chosenItem.id,
              itemName: chosenItem.name,
              priceDeltaAmount: chosenItem.priceDeltaAmount,
            });
          }
        }

        if (selectedOptionsById.size !== selectedItemIds.length) {
          hasChanges = true;
          return [];
        }

        const nextSelectedOptions = selectedItemIds.map((optionId) => {
          const selectedOption = selectedOptionsById.get(optionId);

          if (!selectedOption) {
            throw new Error("Opción de carrito inválida durante reconciliación.");
          }

          return selectedOption;
        });

        const nextUnitOptionsAmount = nextSelectedOptions.reduce(
          (total, selectedOption) => total + selectedOption.priceDeltaAmount,
          0
        );
        const nextItem: CartLineItem = {
          ...item,
          name: product.name,
          slug: product.slug,
          description: product.description,
          priceAmount: product.priceAmount,
          currencyCode: product.currencyCode,
          imageUrl: product.image?.publicUrl ?? null,
          imageAlt: product.image?.altText ?? null,
          selectedOptions: nextSelectedOptions,
          unitOptionsAmount: nextUnitOptionsAmount,
        };

        if (
          nextItem.name !== item.name ||
          nextItem.slug !== item.slug ||
          nextItem.description !== item.description ||
          nextItem.priceAmount !== item.priceAmount ||
          nextItem.currencyCode !== item.currencyCode ||
          nextItem.imageUrl !== item.imageUrl ||
          nextItem.imageAlt !== item.imageAlt ||
          nextItem.unitOptionsAmount !== item.unitOptionsAmount ||
          JSON.stringify(nextItem.selectedOptions) !== JSON.stringify(item.selectedOptions)
        ) {
          hasChanges = true;
        }

        return [nextItem];
      });

      if (!hasChanges) {
        return current;
      }

      if (nextItems.length === 0) {
        const next = { ...current };
        delete next[business.businessId];
        return next;
      }

      return {
        ...current,
        [business.businessId]: {
          businessId: business.businessId,
          businessSlug: business.businessSlug,
          businessName: business.businessName,
          currencyCode: business.currencyCode,
          items: nextItems,
        },
      };
    });
  }, []);

  function updateQuantity(
    businessId: string,
    lineId: string,
    quantity: number
  ) {
    setCarts((current) => {
      const cart = current[businessId];

      if (!cart) {
        return current;
      }

      const nextItems = cart.items
        .map((item) =>
          item.lineId === lineId ? { ...item, quantity } : item
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

  function removeItem(businessId: string, lineId: string) {
    updateQuantity(businessId, lineId, 0);
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
        replaceCart,
        reconcileCart,
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
