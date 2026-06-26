import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { CustomerProfile } from '@/types';

interface AuthState {
  user: CustomerProfile | null;
  session: any | null;
  loading: boolean;
  setUser: (user: CustomerProfile | null) => void;
  setSession: (session: any | null) => void;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
  refreshUser: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      set({ user: data ?? null, session, loading: false });
    } else {
      set({ user: null, session: null, loading: false });
    }
  },
}));
