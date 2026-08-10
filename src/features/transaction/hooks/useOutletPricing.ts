import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';

export type OutletPricingTier = {
  tier_name: string | null;
  harga_ladies: number;
  untung: number;
};

/** Harga & bagi hasil voucher per outlet, dibaca dari tabel `outlet_pricing`
    (bukan hardcode) — supaya nambah outlet/tier baru cukup insert baris,
    tidak perlu ubah kode. Satu outlet bisa punya 0, 1, atau banyak tier. */
export function useOutletPricing(outlet: string) {
  return useQuery({
    queryKey: ['outlet-pricing', outlet],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outlet_pricing')
        .select('tier_name, harga_ladies, untung, outlets!inner(nama_outlet)')
        .eq('outlets.nama_outlet', outlet)
        .eq('is_active', true);

      if (error) throw error;
      return (data ?? []) as unknown as OutletPricingTier[];
    },
    enabled: !!outlet,
    staleTime: 5 * 60_000,
    meta: { errorLabel: 'harga outlet' },
  });
}
