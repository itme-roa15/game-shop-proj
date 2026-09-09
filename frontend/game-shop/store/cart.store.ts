"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, ProductSummary } from "@/types";

interface CartState {
  items: CartItem[];
  drawerOpen: boolean;
  addItem: (product: Product | ProductSummary) => void;
  removeItem: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
  setDrawerOpen: (open: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      drawerOpen: false,
      addItem: (product) =>
        set((state) => {
          const found = state.items.find((item) => item.productId === product.id);
          const items = found
            ? state.items.map((item) => item.productId === product.id
              ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
              : item)
            : [...state.items, {
                productId: product.id,
                name: product.name,
                price: Number(product.price),
                imageUrl: product.imageUrl,
                stock: product.stock,
                quantity: 1,
              }];
          return { items, drawerOpen: true };
        }),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) => item.productId === productId
            ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
            : item),
        })),
      clear: () => set({ items: [] }),
      setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
    }),
    { name: "gameshop-cart", partialize: (state) => ({ items: state.items }) },
  ),
);

