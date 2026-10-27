/**
 * Rekap target hari kerja ladies dalam satu bulan: siapa yang kurang, kurang
 * berapa hari, dan apakah masih terkejar di sisa bulan itu. Dipakai halaman
 * Target Absen & Home pengawas.
 *
 * Fungsi murni (tanggal "hari ini" dioper dari luar) supaya bisa diuji.
 */
import dayjs from 'dayjs';
import { TARGET_HARI_KERJA } from './targetAbsensi';

export type StatusTarget = 'tercapai' | 'mengejar' | 'tidak-tercapai';

type Lady = { id: string; nama_ladies: string; nama_outlet: string | null };
type BarisAbsensi = { ladies_id: string; tanggal: string; status: string };

export type BarisTarget = {
  id: string;
  nama: string;
  outlet: string | null;
  hariKerja: number;
  kurang: number;
  /** Tanggal dari hari ini s/d akhir bulan yang belum punya catatan absensi. */
  sisaHari: number;
  status: StatusTarget;
};

/**
 * Berapa hari lagi ladies masih bisa masuk kerja di bulan itu: tanggal dari
 * hari ini (ikut dihitung) s/d akhir bulan yang belum punya catatan. Tanggal
 * yang sudah tercatat — apa pun statusnya — tidak bisa jadi KERJA lagi tanpa
 * diubah admin, jadi tidak dihitung.
 *
 * @param bulan 'YYYY-MM'
 * @param hariIni 'YYYY-MM-DD'
 */
export function sisaHariTerbuka(bulan: string, hariIni: string, tanggalTercatat: ReadonlySet<string>): number {
  const awal = dayjs(`${bulan}-01`);
  const akhir = awal.endOf('month');
  const hari = dayjs(hariIni);

  if (hari.isAfter(akhir, 'day')) return 0;

  let d = hari.isBefore(awal, 'day') ? awal : hari;
  let sisa = 0;
  while (!d.isAfter(akhir, 'day')) {
    if (!tanggalTercatat.has(d.format('YYYY-MM-DD'))) sisa += 1;
    d = d.add(1, 'day');
  }
  return sisa;
}

export function statusTarget(
  hariKerja: number,
  sisaHari: number,
  target = TARGET_HARI_KERJA
): { kurang: number; status: StatusTarget } {
  const kurang = Math.max(0, target - hariKerja);
  if (kurang === 0) return { kurang, status: 'tercapai' };
  return { kurang, status: kurang <= sisaHari ? 'mengejar' : 'tidak-tercapai' };
}

/**
 * Satu baris per ladies (termasuk yang belum punya catatan sama sekali),
 * urut dari kekurangan terbesar lalu nama.
 *
 * Hari kerja = jumlah TANGGAL berstatus KERJA (huruf besar/kecil diabaikan,
 * sama seperti Home Ladies). Catatan ganda di tanggal yang sama dihitung
 * sekali, supaya data dobel tidak membuat ladies tampak sudah memenuhi target.
 */
export function rekapTargetLadies(
  ladies: Lady[],
  absensi: BarisAbsensi[],
  bulan: string,
  hariIni: string,
  target = TARGET_HARI_KERJA
): BarisTarget[] {
  const kerja = new Map<string, Set<string>>();
  const tercatat = new Map<string, Set<string>>();

  for (const a of absensi) {
    if (!a.tanggal.startsWith(`${bulan}-`)) continue;

    if (!tercatat.has(a.ladies_id)) tercatat.set(a.ladies_id, new Set());
    tercatat.get(a.ladies_id)!.add(a.tanggal);

    if (a.status.toUpperCase() === 'KERJA') {
      if (!kerja.has(a.ladies_id)) kerja.set(a.ladies_id, new Set());
      kerja.get(a.ladies_id)!.add(a.tanggal);
    }
  }

  return ladies
    .map((l): BarisTarget => {
      const hariKerja = kerja.get(l.id)?.size ?? 0;
      const sisaHari = sisaHariTerbuka(bulan, hariIni, tercatat.get(l.id) ?? new Set());
      return {
        id: l.id,
        nama: l.nama_ladies,
        outlet: l.nama_outlet,
        hariKerja,
        sisaHari,
        ...statusTarget(hariKerja, sisaHari, target),
      };
    })
    .sort((a, b) => b.kurang - a.kurang || a.nama.localeCompare(b.nama, 'id'));
}
