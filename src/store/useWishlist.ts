import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

interface WishlistState {
  items: Product[];
  loading: boolean;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlist = create<WishlistState>((set, get) => ({
  items: [],
  loading: false,
  fetchWishlist: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    set({ loading: true });
    const { data } = await supabase
      .from('wishlist')
      .select('product_id, products(*)')
      .eq('customer_id', session.user.id);
    if (data) {
      const products = data.map((d: any) => d.products).filter(Boolean);
      set({ items: products, loading: false });
    } else {
      set({ loading: false });
    }
  },
  addToWishlist: async (product) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from('wishlist').insert({
      customer_id: session.user.id,
      product_id: product.id,
    });
    set((state) => ({ items: [...state.items, product] }));
  },
  removeFromWishlist: async (productId) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase
      .from('wishlist')
      .delete()
      .eq('customer_id', session.user.id)
      .eq('product_id', productId);
    set((state) => ({
      items: state.items.filter((p) => p.id !== productId),
    }));
  },
  isInWishlist: (productId) => {
    return get().items.some((p) => p.id === productId);
  },
}));
