import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

/**
 * Saklar menu aktif/nonaktif dari tabel `pengaturan_menu`
 * (supabase/sql/e2-pengaturan-menu.sql), diatur admin di halaman Pengaturan.
 *
 * Gagal dimuat — termasuk karena tabelnya belum dibuat — berarti TIDAK ADA
 * menu yang dinonaktifkan: lebih baik menu yang mestinya tersembunyi sempat
 * terlihat daripada sidebar mendadak kosong. Toast ditahan (senyap) karena
 * query ini jalan di setiap halaman lewat sidebar/navbar.
 */

export const KUNCI_PENGATURAN_MENU = ['pengaturan-menu'];

export type SaklarMenu = { kunci: string; aktif: boolean };

export function usePengaturanMenu() {
  return useQuery({
    queryKey: KUNCI_PENGATURAN_MENU,
    queryFn: async () => {
      const { data, error } = await supabase.from('pengaturan_menu').select('kunci, aktif');
      if (error) throw error;
      return (data ?? []) as SaklarMenu[];
    },
    retry: 1,
    meta: { errorLabel: 'pengaturan menu', senyap: true },
  });
}

/** Kunci menu yang sedang dinonaktifkan, mis. 'admin.absensi'. */
export function useMenuNonaktif(): ReadonlySet<string> {
  const { data } = usePengaturanMenu();
  return useMemo(() => new Set((data ?? []).filter((s) => !s.aktif).map((s) => s.kunci)), [data]);
}
