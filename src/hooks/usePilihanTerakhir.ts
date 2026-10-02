import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export type JenisPilihan = 'ladies' | 'pengawas';

const kunciStorage = (jenis: JenisPilihan) => `sr-pilihan-${jenis}`;

// sessionStorage bisa melempar (mode privat, data situs diblokir) — pilihan
// terakhir hanya kenyamanan, jadi kegagalan cukup diabaikan.
const bacaStorage = (jenis: JenisPilihan): string => {
  try {
    return sessionStorage.getItem(kunciStorage(jenis)) ?? '';
  } catch {
    return '';
  }
};

const tulisStorage = (jenis: JenisPilihan, id: string) => {
  try {
    if (id) sessionStorage.setItem(kunciStorage(jenis), id);
    else sessionStorage.removeItem(kunciStorage(jenis));
  } catch {
    /* abaikan — lihat bacaStorage */
  }
};

/**
 * Ladies/pengawas yang sedang dipilih admin, dibawa antar halaman
 * (Transaksi, Buku Kuning, Absensi) supaya tidak perlu memilih ulang.
 *
 * - Sumber utama: query URL (`?ladies=<id>` / `?pengawas=<id>`) — tombol
 *   kembali, refresh, dan link yang dibagikan tetap membuka orang yang sama.
 * - Cadangan: pilihan terakhir di sessionStorage (per tab, hilang saat app
 *   ditutup) — dipakai saat pindah halaman lewat menu yang tidak membawa
 *   query; URL lalu ikut disesuaikan.
 *
 * Pengganti langsung `useState('')`: mengembalikan [id, setId].
 */
export function usePilihanTerakhir(jenis: JenisPilihan): [string, (id: string) => void] {
  const [params, setParams] = useSearchParams();
  const dariUrl = params.get(jenis);
  const nilai = dariUrl ?? bacaStorage(jenis);

  const setNilai = useCallback(
    (id: string) => {
      tulisStorage(jenis, id);
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          if (id) p.set(jenis, id);
          else p.delete(jenis);
          return p;
        },
        { replace: true }
      );
    },
    [jenis, setParams]
  );

  // Selaraskan dua arah: URL → storage (link dibuka langsung), dan
  // storage → URL (masuk lewat menu tanpa query).
  useEffect(() => {
    if (dariUrl !== null) {
      tulisStorage(jenis, dariUrl);
    } else if (nilai) {
      setNilai(nilai);
    }
  }, [dariUrl, jenis, nilai, setNilai]);

  return [nilai, setNilai];
}
