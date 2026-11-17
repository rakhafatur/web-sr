import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { supabase } from '../../../lib/supabaseClient';
import { ringkasAbsenHarian } from '../../absensi/utils/ringkasHarian';
import { JUMLAH_HARI_GRAFIK, ringkasBeranda, type BarisVoucher } from '../utils/ringkasBeranda';

type Lady = { id: string; nama_ladies: string; nama_outlet: string | null };
type Catatan = { ladies_id: string; status: string };

const UKURAN_HALAMAN = 1000;

/**
 * Semua voucher dalam rentang tanggal. Supabase membatasi jumlah baris per
 * permintaan, dan total Home harus lengkap — jadi diambil per halaman sampai
 * jumlahnya sama dengan `count` dari server, bukan berhenti di halaman pertama.
 *
 * Saringan & relasi `ladies` sama dengan Rekap Voucher supaya angkanya cocok.
 */
async function ambilVoucher(dari: string, sampai: string): Promise<BarisVoucher[]> {
  const semua: BarisVoucher[] = [];

  for (;;) {
    const { data, count, error } = await supabase
      .from('vouchers')
      .select('tanggal, jumlah_voucher, untung, ladies_id, ladies ( nama_ladies, nama_outlet )', {
        count: 'exact',
      })
      .gte('tanggal', dari)
      .lte('tanggal', sampai)
      .not('ladies_id', 'is', null)
      // Urutan tetap supaya halaman tidak tumpang-tindih.
      .order('tanggal', { ascending: true })
      .order('id', { ascending: true })
      .range(semua.length, semua.length + UKURAN_HALAMAN - 1);

    if (error) throw error;

    // Supabase mengetik relasi `ladies` sebagai array untuk nested select,
    // padahal di sini selalu satu baris — dinormalkan lewat unknown, sama
    // seperti di RekapVoucherPage.
    const baris = (data ?? []) as unknown as BarisVoucher[];
    semua.push(...baris);

    if (baris.length === 0 || semua.length >= (count ?? 0)) return semua;
  }
}

/**
 * Data Home admin (mobile): voucher bulan ini & 7 hari terakhir, absensi
 * hari ini, dan jumlah user yang menunggu persetujuan.
 *
 * Kunci & kolom ladies aktif, absensi harian, dan jumlah persetujuan sengaja
 * sama dengan halaman Absen Harian / Users, jadi cache-nya terpakai bersama.
 */
export function useBerandaAdmin() {
  // Dibekukan sekali — kunci cache tetap stabil selama halaman terbuka.
  const [hariIni] = useState(() => dayjs().format('YYYY-MM-DD'));

  const awalBulan = dayjs(hariIni).startOf('month');
  const awalGrafik = dayjs(hariIni).subtract(JUMLAH_HARI_GRAFIK - 1, 'day');
  const dari = (awalGrafik.isBefore(awalBulan) ? awalGrafik : awalBulan).format('YYYY-MM-DD');
  const sampai = dayjs(hariIni).endOf('month').format('YYYY-MM-DD');

  const voucher = useQuery({
    queryKey: ['beranda-admin', 'voucher', dari, sampai],
    queryFn: () => ambilVoucher(dari, sampai),
    meta: { errorLabel: 'ringkasan voucher' },
  });

  const ladies = useQuery({
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

  const absensi = useQuery({
    queryKey: ['absensi-harian', hariIni],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('absensi')
        .select('ladies_id, status, keterangan')
        .eq('tanggal', hariIni);

      if (error) throw error;
      return (data ?? []) as Catatan[];
    },
    meta: { errorLabel: 'absensi harian' },
  });

  // Bukan isi utama halaman — kegagalannya tidak perlu toast sendiri.
  const menunggu = useQuery({
    queryKey: ['user-approval', 'jumlah'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', false);
      if (error) throw error;
      return count ?? 0;
    },
    meta: { errorLabel: 'jumlah user menunggu persetujuan', senyap: true },
  });

  const ringkasan = useMemo(() => ringkasBeranda(voucher.data ?? [], hariIni), [voucher.data, hariIni]);

  const daftarLadies = ladies.data;
  const catatan = absensi.data;
  const absen = useMemo(
    () => ringkasAbsenHarian((daftarLadies ?? []).map((l) => l.id), catatan ?? []),
    [daftarLadies, catatan]
  );

  return {
    hariIni,
    ringkasan,
    absen,
    jumlahLadies: (daftarLadies ?? []).length,
    jumlahMenunggu: menunggu.data ?? 0,
    loading: voucher.isLoading || ladies.isLoading || absensi.isLoading,
    refetch: () => Promise.all([voucher.refetch(), ladies.refetch(), absensi.refetch(), menunggu.refetch()]),
  };
}
