import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs, { type Dayjs } from 'dayjs';
import { supabase } from '../../../lib/supabaseClient';
import { rekapTargetLadies } from '../../absensi/utils/targetLadies';

type Lady = { id: string; nama_ladies: string; nama_outlet: string | null };
type BarisAbsensi = { ladies_id: string; tanggal: string; status: string };

/**
 * Rekap target hari kerja semua ladies aktif untuk satu bulan — dipakai
 * halaman Target Absen dan Home pengawas (kuncinya sama, jadi cache-nya
 * terpakai bersama).
 */
export function useTargetLadies(bulan: Dayjs) {
  const kunciBulan = bulan.format('YYYY-MM');

  // Kunci & kolom sama dengan Absen Harian / Absensi admin, jadi cache-nya
  // terpakai bersama.
  const ladiesQuery = useQuery({
    queryKey: ['ladies-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ladies')
        .select('id, nama_ladies, nama_outlet, pin, status')
        .eq('status', 'active')
        .order('nama_ladies', { ascending: true });

      if (error) throw error;
      return (data ?? []) as Lady[];
    },
    meta: { errorLabel: 'data ladies' },
  });

  const absensiQuery = useQuery({
    queryKey: ['absensi-bulanan', kunciBulan],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('absensi')
        .select('ladies_id, tanggal, status')
        .gte('tanggal', bulan.startOf('month').format('YYYY-MM-DD'))
        .lte('tanggal', bulan.endOf('month').format('YYYY-MM-DD'));

      if (error) throw error;
      return (data ?? []) as BarisAbsensi[];
    },
    meta: { errorLabel: 'absensi ladies' },
  });

  const ladies = ladiesQuery.data;
  const absensi = absensiQuery.data;
  const baris = useMemo(
    () => rekapTargetLadies(ladies ?? [], absensi ?? [], kunciBulan, dayjs().format('YYYY-MM-DD')),
    [ladies, absensi, kunciBulan]
  );

  return {
    baris,
    loading: ladiesQuery.isLoading || absensiQuery.isLoading,
    refetch: async () => {
      await Promise.all([ladiesQuery.refetch(), absensiQuery.refetch()]);
    },
  };
}
