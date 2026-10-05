import type { Dayjs } from 'dayjs';
import { outletBaris, type VoucherRow } from '../../transaction/utils/rekapVoucher';

/** Indeks hari dayjs (`.day()`): 0 = Minggu, 1 = Senin, 2 = Selasa, ... */
export const SENIN = 1;
export const SELASA = 2;

export type HariAwalMinggu = typeof SENIN | typeof SELASA;

/**
 * Minggu operasional SR dimulai hari Selasa (Selasa–Senin). Outlet yang
 * menghitung minggunya berbeda didaftarkan di sini — kunci huruf kecil.
 */
const HARI_AWAL_KHUSUS: Record<string, HariAwalMinggu> = {
  travel: SENIN, // Senin–Minggu
};

export const hariAwalMingguOutlet = (outlet: string): HariAwalMinggu =>
  HARI_AWAL_KHUSUS[outlet.trim().toLowerCase()] ?? SELASA;

export const labelPeriodeMinggu = (hariAwal: HariAwalMinggu) =>
  hariAwal === SENIN ? 'Senin–Minggu' : 'Selasa–Senin';

/**
 * Rentang 7 hari minggu berjalan (mundur = 0) atau minggu-minggu sebelumnya
 * (mundur = 1 untuk minggu lalu), dihitung dari `hariIni`.
 */
export function rentangMinggu(hariAwal: HariAwalMinggu, mundur: number, hariIni: Dayjs) {
  const awalMingguIni =
    hariIni.day() >= hariAwal ? hariIni.day(hariAwal) : hariIni.subtract(1, 'week').day(hariAwal);

  const awal = awalMingguIni.subtract(mundur, 'week').startOf('day');
  return { awal, akhir: awal.add(6, 'day') };
}

/**
 * Kelompokkan baris voucher per outlet. Outlet diambil dari kolom yang
 * tersimpan di transaksi (outletBaris), bukan outlet ladies saat ini.
 * Semua outlet di `daftarOutlet` selalu muncul (walau kosong) sesuai urutan
 * daftar; outlet lain yang punya transaksi menyusul di belakang.
 */
export function kelompokkanPerOutlet(rows: VoucherRow[], daftarOutlet: string[]): Map<string, VoucherRow[]> {
  const hasil = new Map<string, VoucherRow[]>(daftarOutlet.map((o) => [o, []]));

  for (const row of rows) {
    const outlet = outletBaris(row);
    if (!hasil.has(outlet)) hasil.set(outlet, []);
    hasil.get(outlet)!.push(row);
  }

  return hasil;
}
