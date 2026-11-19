import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  imagenUrl: string;
  stock?: number;
  cantidad: number;
}

interface AddToCartInput {
  id: string;
  nombre: string;
  precio: number;
  imagenUrl: string;
  stock?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: AddToCartInput) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, cantidad: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemQuantity: (productId: string) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        if (product.stock !== undefined && product.stock <= 0) {
          return false;
        }

        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);

        if (existingItem) {
          const currentQty = Number(existingItem.cantidad) || 1;
          const maxStock = product.stock ?? existingItem.stock;

          if (maxStock !== undefined && currentQty >= maxStock) {
            return false;
          }

          set({
            items: currentItems.map((item) =>
              item.id === product.id
                ? {
                    ...item,
                    stock: maxStock,
                    cantidad: currentQty + 1,
                  }
                : item
            ),
          });
          return true;
        }

        set({
          items: [
            ...currentItems,
            {
              ...product,
              cantidad: 1,
            },
          ],
        });
        return true;
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.id !== productId),
        });
      },

      updateQuantity: (productId, cantidad) => {
        if (!Number.isFinite(cantidad) || cantidad <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((item) => {
            if (item.id !== productId) return item;
            const safeCantidad =
              item.stock !== undefined ? Math.min(cantidad, item.stock) : cantidad;
            return { ...item, cantidad: safeCantidad };
          }),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () =>
        get().items.reduce((total, item) => total + (Number(item.cantidad) || 0), 0),

      getTotalPrice: () =>
        get().items.reduce(
          (total, item) => total + item.precio * (Number(item.cantidad) || 0),
          0
        ),

      getItemQuantity: (productId) => {
        const found = get().items.find((item) => item.id === productId);
        return found ? Number(found.cantidad) || 0 : 0;
      },
    }),
    {
      name: "petmarket-cart-storage",
    }
  )
);