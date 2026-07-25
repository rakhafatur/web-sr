import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!ladiesId) return;

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);

      const bulanAwal = selectedMonth.startOf('month');
      const bulanAkhir = selectedMonth.endOf('month');

      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('ladies_id', ladiesId)
        .gte('tanggal', bulanAwal.format('YYYY-MM-DD'))
        .lte('tanggal', bulanAkhir.format('YYYY-MM-DD'))
        .order('tanggal', { ascending: false });

      if (cancelled) return;

      if (error || !data) {
        toast.error(`Gagal memuat data ${errorLabel}. Coba lagi.`);
        setList([]);
        setLoading(false);
        return;
      }

      setList(data as T[]);
      setLoading(false);
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [table, ladiesId, selectedMonth, errorLabel]);

  return { list, loading };
}
