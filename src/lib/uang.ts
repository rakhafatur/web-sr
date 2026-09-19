/**
 * Format nominal rupiah — satu-satunya tempat angka uang diubah jadi teks.
 *
 * Sebelum ini `toLocaleString('id-ID')` tersebar di 19 tempat pada 12 berkas
 * dengan tiga gaya berbeda ("Rp1.000", "Rp 1.000", "- Rp 1.000"), dan itu
 * yang membuat nominal terlihat tidak seragam antar halaman.
 *
 * CATATAN: `src/features/transaction/utils/biayaBulanan.ts` punya
 * formatter sendiri dan SENGAJA tidak disatukan di sini — berkas itu bagian
 * dari perhitungan uang yang tidak boleh disentuh oleh pekerjaan tampilan.
 */

/** Arah aliran uang, menentukan warna & tanda di <Money>. */
export type ArahUang = 'masuk' | 'keluar' | 'netral';

/** Angka tidak sah tidak boleh sampai ke layar sebagai "NaN". */
function amankan(nilai: number): number {
  return Number.isFinite(nilai) ? nilai : 0;
}

/**
 * Digit berpemisah titik, tanpa awalan dan tanpa tanda.
 * Awalan "Rp" dan tanda +/− dirender terpisah oleh <Money> supaya keduanya
 * bisa diberi warna dan bobot sendiri.
 */
export function formatRupiah(nilai: number): string {
  return Math.round(Math.abs(amankan(nilai))).toLocaleString('id-ID');
}

/**
 * Versi teks utuh — untuk PDF, aria-label, dan pesan notifikasi, yaitu
 * tempat-tempat yang tidak bisa merender elemen terpisah.
 * Memakai minus tipografis (−, U+2212), bukan tanda hubung.
 */
export function formatRupiahPenuh(nilai: number): string {
  const aman = amankan(nilai);
  const tanda = aman < 0 ? '−' : '';
  return `${tanda}Rp ${formatRupiah(aman)}`;
}
