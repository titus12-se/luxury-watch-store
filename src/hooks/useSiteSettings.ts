import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { SiteSetting } from '@/types/admin';

export function useSiteSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('site_settings').select('*');
      const map: Record<string, string> = {};
      (data ?? []).forEach((s: SiteSetting) => {
        map[s.key] = s.value;
      });
      setSettings(map);
      setLoading(false);
    }
    fetchSettings();
  }, []);

  return { settings, loading };
}
