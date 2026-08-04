import { useQuery } from '@tanstack/react-query';
import type { Dayjs } from 'dayjs';
import { supabase } from '../../../lib/supabaseClient';

/**
 * Fetch data bulanan (voucher/kasbon/dokter/pemasukan lain) milik satu ladies dari Supabase.
 * Di-cache per (table, ladiesId, bulan) lewat React Query — pindah bulan/halaman lalu balik
 * lagi akan langsung tampil dari cache dulu sambil di-refresh diam-diam di belakang.
 */
export function useLedgerData<T>(
  table: string,
  ladiesId: string | undefined,
  selectedMonth: Dayjs,
  errorLabel: string
) {
  const monthKey = selectedMonth.format('YYYY-MM');

  const query = useQuery({
    queryKey: ['ledger', table, ladiesId, monthKey],
    queryFn: async () => {
      const bulanAwal = selectedMonth.startOf('month');
      const bulanAkhir = selectedMonth.endOf('month');

      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('ladies_id', ladiesId as string)
        .gte('tanggal', bulanAwal.format('YYYY-MM-DD'))
        .lte('tanggal', bulanAkhir.format('YYYY-MM-DD'))
        .order('tanggal', { ascending: false });

      if (error) throw error;

      return (data ?? []) as T[];
    },
    enabled: !!ladiesId,
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
