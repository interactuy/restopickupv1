"use client";

import type { ReactNode } from "react";

import { CartProvider } from "@/components/cart/cart-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return <CartProvider>{children}</CartProvider>;
}
