import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import {
  BIAYA_BULANAN_OUTLETS,
  KASBON_ADMIN_JUMLAH,
  DOKTER_SPEKULO_JUMLAH,
} from '../utils/biayaBulanan';

export type BiayaOutlet = {
  nama_outlet: string;
  kasbon_admin: number;
  dokter_spekulo: number;
};

/**
 * Konfigurasi biaya bulanan per outlet, dibaca dari tabel `outlets`.
 *
 * Sebelumnya daftar outlet dan nominalnya di-hardcode, sehingga outlet baru
 * tidak pernah ikut proses biaya bulanan dan nominalnya cuma bisa diubah
 * lewat deploy.
 *
 * Kalau kolom konfigurasinya belum ada di database (SQL d3 belum dijalankan),
 * hook ini jatuh ke nilai lama yang persis sama dengan perilaku sebelumnya —
 * jadi kode ini aman dirilis lebih dulu dan otomatis berpindah ke konfigurasi
 * database begitu SQL-nya dijalankan.
 */
export function useBiayaBulananConfig() {
  const query = useQuery({
    queryKey: ['biaya-bulanan-config'],
    queryFn: async (): Promise<{ outlets: BiayaOutlet[]; dariDatabase: boolean }> => {
      const { data, error } = await supabase
        .from('outlets')
        .select('nama_outlet, kasbon_admin, dokter_spekulo')
        .eq('kena_biaya_bulanan', true)
        .eq('is_active', true)
        .order('nama_outlet');

      if (error) {
        // Kolom belum ada -> pakai nilai lama, jangan gagalkan halaman.
        return {
          outlets: BIAYA_BULANAN_OUTLETS.map((nama_outlet) => ({
            nama_outlet,
            kasbon_admin: KASBON_ADMIN_JUMLAH,
            dokter_spekulo: DOKTER_SPEKULO_JUMLAH,
          })),
          dariDatabase: false,
        };
      }

      return {
        outlets: (data ?? []).map((o) => ({
          nama_outlet: o.nama_outlet,
          // Nominal kosong di database diperlakukan sebagai nol, bukan
          // diam-diam memakai angka lama — supaya salah konfigurasi terlihat.
          kasbon_admin: Number(o.kasbon_admin ?? 0),
          dokter_spekulo: Number(o.dokter_spekulo ?? 0),
        })),
        dariDatabase: true,
      };
    },
    staleTime: 5 * 60_000,
    // Tidak memakai errorLabel: kegagalan di sini sudah ditangani dengan
    // fallback, jadi tidak perlu memunculkan toast ke user.
  });

  return {
    outlets: query.data?.outlets ?? [],
    dariDatabase: query.data?.dariDatabase ?? false,
    loading: query.isLoading,
  };
}
