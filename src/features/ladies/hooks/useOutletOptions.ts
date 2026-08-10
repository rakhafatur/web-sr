import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export type OutletOption = { id: string; nama_outlet: string };

/** Daftar outlet aktif untuk dropdown pemilihan outlet di form Ladies (Create & Detail). */
export function useOutletOptions() {
  const [outlets, setOutlets] = useState<OutletOption[]>([]);

  useEffect(() => {
    const loadOutlets = async () => {
      const { data } = await supabase
        .from('outlets')
        .select('id, nama_outlet')
        .eq('is_active', true)
        .order('nama_outlet');

      setOutlets(data || []);
    };

    loadOutlets();
  }, []);

  return outlets;
}
