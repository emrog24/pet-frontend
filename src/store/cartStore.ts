import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  imagenUrl: string;
  cantidad: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'cantidad'>) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === newItem.id);

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === newItem.id
                  ? { ...item, cantidad: item.cantidad + 1 }
                  : item
              ),
            };
          } else {
            return {
              items: [...state.items, { ...newItem, cantidad: 1 }],
            };
          }
        });
      },

      updateQuantity: (id, cantidad) => {
        set((state) => {
          if (cantidad <= 0) {
            return {
              items: state.items.filter((item) => item.id !== id),
            };
          }
          return {
            items: state.items.map((item) =>
              item.id === id ? { ...item, cantidad } : item
            ),
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.cantidad, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.precio * item.cantidad, 0);
      },
    }),
    {
      name: 'petmarket-cart-storage',
    }
  )
);