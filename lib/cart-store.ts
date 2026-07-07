'use client';

/**
 * Carrito persistente (Zustand + localStorage).
 *
 * Guarda solo lo necesario para reconstruir el pedido; el precio se guarda
 * en el momento de añadir para que el total sea estable aunque cambie el
 * catálogo. Los importes se manejan en soles (number) aquí y se convierten
 * a céntimos en checkout.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from './types';

export interface CartItem {
  slug: string;
  name: string;
  price: number; // PEN por unidad
  unit?: string;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  add: (product: Product, quantity?: number) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      add: (product, quantity = 1) =>
        set((state) => {
          if (typeof product.price !== 'number' || !product.purchasable) {
            return state; // producto no comprable: ignorar
          }
          const existing = state.items.find((i) => i.slug === product.slug);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.slug === product.slug
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [
              ...state.items,
              {
                slug: product.slug,
                name: product.name,
                price: product.price,
                unit: product.priceUnit,
                image: product.image,
                quantity,
              },
            ],
            isOpen: true,
          };
        }),

      remove: (slug) =>
        set((state) => ({ items: state.items.filter((i) => i.slug !== slug) })),

      setQuantity: (slug, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.slug !== slug)
              : state.items.map((i) =>
                  i.slug === slug ? { ...i, quantity } : i
                ),
        })),

      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    { name: 'pp_cart' }
  )
);

/** Selectores derivados (fuera del store para evitar renders innecesarios). */
export function cartCount(items: CartItem[]): number {
  return items.reduce((n, i) => n + i.quantity, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
