import type { OutletPricingTier } from '../hooks/useOutletPricing';

/**
 * Menentukan tier harga mana yang berlaku untuk transaksi voucher yang sedang
 * diinput, dari daftar tier milik outlet ladies tersebut.
 *
 * Dipisah dari komponen supaya bisa diuji: hasil fungsi ini menentukan berapa
 * rupiah yang tersimpan di kolom `jumlah` dan `untung` sebuah transaksi, dan
 * angka itu di-snapshot permanen ke baris transaksinya.
 *
 * Aturan:
 * - Outlet tanpa tier (mis. Royal/SA) hanya punya satu baris dengan
 *   `tier_name: null` — itu yang dipakai, tanpa pilihan apa pun di UI.
 * - Outlet bertier (mis. Travel: Single/Double) memakai tier yang dipilih user;
 *   kalau belum memilih, tier pertama jadi default.
 * - Daftar kosong (outlet belum dikonfigurasi) mengembalikan `undefined` —
 *   pemanggil WAJIB memblokir penyimpanan, bukan menebak harga.
 */
export function pilihTier(
  tiers: OutletPricingTier[],
  selectedTierName: string | null
): OutletPricingTier | undefined {
  return tiers.find((t) => t.tier_name === selectedTierName) ?? tiers[0];
}

/** Outlet dianggap bertier (perlu pilihan di UI) hanya kalau punya >1 tier. */
export function perluPilihTier(tiers: OutletPricingTier[]): boolean {
  return tiers.length > 1;
}

/** Total rupiah untuk ladies dari sejumlah pcs voucher pada tier tertentu. */
export function hitungJumlahVoucher(
  jumlahPcs: number,
  tier: OutletPricingTier
): number {
  return jumlahPcs * tier.harga_ladies;
}

/** Total keuntungan agency dari sejumlah pcs voucher pada tier tertentu. */
export function hitungUntungVoucher(
  jumlahPcs: number,
  tier: OutletPricingTier
): number {
  return jumlahPcs * tier.untung;
}
