'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabase';

export function useProProfile() {
  const router = useRouter();
  const [pro, setPro] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/connexion');
        return;
      }
      const { data } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setPro(data);
      setLoading(false);
    }
    load();
  }, [router]);

  return { pro, setPro, loading };
}
