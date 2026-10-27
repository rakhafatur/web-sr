import { useQuery } from '@tanstack/react-query';
import type { Dayjs } from 'dayjs';
import { supabase } from '../../../lib/supabaseClient';

/**
 * Fetch data bulanan (voucher/kasbon/dokter/pemasukan lain milik ladies, atau
 * gaji/kasbon milik pengawas) dari Supabase. Di-cache per (table, pemilik, bulan)
 * lewat React Query — pindah bulan/halaman lalu balik lagi akan langsung tampil
 * dari cache dulu sambil di-refresh diam-diam di belakang.
 */
export function useLedgerData<T>(
  table: string,
  pemilikId: string | null | undefined,
  selectedMonth: Dayjs,
  errorLabel: string,
  columns = '*',
  kolomPemilik: 'ladies_id' | 'pengawas_id' = 'ladies_id'
) {
  const monthKey = selectedMonth.format('YYYY-MM');

  const query = useQuery({
    queryKey: ['ledger', table, pemilikId, monthKey],
    queryFn: async () => {
      const bulanAwal = selectedMonth.startOf('month');
      const bulanAkhir = selectedMonth.endOf('month');

      const { data, error } = await supabase
        .from(table)
        .select(columns)
        .eq(kolomPemilik, pemilikId as string)
        .gte('tanggal', bulanAwal.format('YYYY-MM-DD'))
        .lte('tanggal', bulanAkhir.format('YYYY-MM-DD'))
        .order('tanggal', { ascending: false });

      if (error) throw error;

      return (data ?? []) as T[];
    },
    enabled: !!pemilikId,
    meta: { errorLabel },
  });

  return {
    list: query.data ?? [],
    loading: query.isLoading,
    refetch: async () => {
      await query.refetch();
    },
  };
}
