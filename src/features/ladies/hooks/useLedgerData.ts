import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dayjs } from 'dayjs';
import { toast } from 'react-toastify';
import { supabase } from '../../../lib/supabaseClient';

/**
 * Fetch data bulanan (voucher/kasbon/dokter/pemasukan lain) milik satu ladies dari Supabase.
 * `cancelled` mencegah response yang telat (mis. ganti bulan cepat-cepat) menimpa data bulan yang sedang dilihat.
 */
export function useLedgerData<T>(
  table: string,
  ladiesId: string | undefined,
  selectedMonth: Dayjs,
  errorLabel: string
) {
  const [list, setList] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const cancelledRef = useRef(false);

  const fetchData = useCallback(
    async (showLoading: boolean) => {
      if (!ladiesId) return;

      if (showLoading) setLoading(true);

      const bulanAwal = selectedMonth.startOf('month');
      const bulanAkhir = selectedMonth.endOf('month');

      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('ladies_id', ladiesId)
        .gte('tanggal', bulanAwal.format('YYYY-MM-DD'))
        .lte('tanggal', bulanAkhir.format('YYYY-MM-DD'))
        .order('tanggal', { ascending: false });

      if (cancelledRef.current) return;

      if (error || !data) {
        toast.error(`Gagal memuat data ${errorLabel}. Coba lagi.`);
        setList([]);
      } else {
        setList(data as T[]);
      }

      if (showLoading) setLoading(false);
    },
    [table, ladiesId, selectedMonth, errorLabel]
  );

  useEffect(() => {
    cancelledRef.current = false;
    fetchData(true);

    return () => {
      cancelledRef.current = true;
    };
  }, [fetchData]);

  /** Refetch diam-diam (dipakai pull-to-refresh) — tidak toggle `loading`
      supaya konten yang sudah tampil tidak diganti skeleton lagi. */
  const refetch = useCallback(() => fetchData(false), [fetchData]);

  return { list, loading, refetch };
}
