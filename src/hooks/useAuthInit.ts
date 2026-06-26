import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/useAuth';

export function useAuthInit() {
  const { setUser, setSession } = useAuth();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('customers')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        setUser(data ?? null);
        setSession(session);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        (async () => {
          const { data } = await supabase
            .from('customers')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          setUser(data ?? null);
          setSession(session);
        })();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession]);
}
