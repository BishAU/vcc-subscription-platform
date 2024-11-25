import create from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types/product';

interface CartStore {
    items: CartItem[];
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product: Product, quantity = 1) => {
                set((state) => {
                    const existingItem = state.items.find(
                        (item) => item.productId === product.id
                    );

                    if (existingItem) {
                        return {
                            items: state.items.map((item) =>
                                item.productId === product.id
                                    ? { ...item, quantity: item.quantity + quantity }
                                    : item
                            ),
                        };
                    }

                    return {
                        items: [
                            ...state.items,
                            {
                                productId: product.id,
                                quantity,
                                price: product.price,
                                metadata: {
                                    name: product.name,
                                    category: product.category,
                                    stripePriceId: product.stripePriceId,
                                    recurringBilling: product.metadata.recurringBilling,
                                },
                            },
                        ],
                    };
                });
            },

            removeItem: (productId: string) => {
                set((state) => ({
                    items: state.items.filter((item) => item.productId !== productId),
                }));
            },

            updateQuantity: (productId: string, quantity: number) => {
                if (quantity < 1) {
                    get().removeItem(productId);
                    return;
                }

                set((state) => ({
                    items: state.items.map((item) =>
                        item.productId === productId
                            ? { ...item, quantity }
                            : item
                    ),
                }));
            },

            clearCart: () => {
                set({ items: [] });
            },

            getTotal: () => {
                return get().items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                );
            },

            getItemCount: () => {
                return get().items.reduce(
                    (count, item) => count + item.quantity,
                    0
                );
            },
        }),
        {
            name: 'shopping-cart',
            getStorage: () => localStorage,
        }
    )
);
