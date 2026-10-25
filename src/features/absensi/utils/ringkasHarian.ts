/**
 * Ringkasan absensi satu tanggal untuk halaman Absen Harian: berapa ladies
 * yang sudah/belum diabsen dan rekap per status.
 *
 * Dihitung terhadap daftar ladies yang sedang ditampilkan (ladies aktif),
 * bukan terhadap semua baris absensi tanggal itu — catatan milik ladies yang
 * sudah nonaktif tidak boleh membuat progres melebihi 100%.
 */
import { hitungRekapAbsensi, type RekapAbsensi } from './rekapAbsensi';

type CatatanHarian = { ladies_id: string; status: string };

export type RingkasanHarian = {
  total: number;
  sudah: number;
  /** id ladies yang belum punya catatan, urut sesuai daftar ladies. */
  belum: string[];
  rekap: RekapAbsensi;
};

export function ringkasAbsenHarian(ladiesIds: string[], catatan: CatatanHarian[]): RingkasanHarian {
  const perLadies = new Map(catatan.map((c) => [c.ladies_id, c]));

  const tercatat: CatatanHarian[] = [];
  const belum: string[] = [];

  for (const id of ladiesIds) {
    const c = perLadies.get(id);
    if (c) tercatat.push(c);
    else belum.push(id);
  }

  return {
    total: ladiesIds.length,
    sudah: tercatat.length,
    belum,
    rekap: hitungRekapAbsensi(tercatat),
  };
}
