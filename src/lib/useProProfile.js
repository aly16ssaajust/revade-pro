'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabase';

const GUEST_PRO = {
  id: '00000000-0000-0000-0000-000000000000',
  prenom: 'Invité',
  nom: '',
  specialite: '',
};

export function useProProfile() {
  const router = useRouter();
  const [pro, setPro] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Accès libre : profil invité au lieu de rediriger vers /connexion
        setPro(GUEST_PRO);
        setLoading(false);
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
