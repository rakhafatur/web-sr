import { ringkasAbsenHarian } from '../../absensi/utils/ringkasHarian';
import type { RekapAbsensi } from '../../absensi/utils/rekapAbsensi';

type Lady = { id: string; nama_ladies: string; nama_outlet: string | null };
type CatatanHarian = { ladies_id: string; status: string };

export type StatusAbsenOutlet = {
  outlet: string;
  rekap: RekapAbsensi;
  /** Nama ladies yang belum punya catatan, urut sesuai daftar ladies. */
  belum: string[];
};

/**
 * Status absen satu tanggal per outlet, memakai perhitungan yang sama dengan
 * halaman Absen Harian. Hanya outlet yang punya ladies aktif yang muncul.
 */
export function statusAbsenPerOutlet(ladies: Lady[], catatan: CatatanHarian[]): StatusAbsenOutlet[] {
  const perOutlet = new Map<string, Lady[]>();

  for (const lady of ladies) {
    const outlet = lady.nama_outlet || 'Tanpa Outlet';
    if (!perOutlet.has(outlet)) perOutlet.set(outlet, []);
    perOutlet.get(outlet)!.push(lady);
  }

  return [...perOutlet.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([outlet, anggota]) => {
      const { rekap, belum } = ringkasAbsenHarian(
        anggota.map((l) => l.id),
        catatan
      );

      return {
        outlet,
        rekap,
        belum: anggota.filter((l) => belum.includes(l.id)).map((l) => l.nama_ladies),
      };
    });
}
