/** Kolom voucher yang tersimpan, dibutuhkan untuk mengubah jumlah pcs. */
export type VoucherTersimpan = {
  jumlah: number;
  jumlah_voucher: number;
  /** null untuk transaksi lama yang dibuat sebelum kolom `untung` ada. */
  untung: number | null;
};

/**
 * Nominal (`jumlah`) & `untung` baru saat jumlah pcs voucher diubah.
 *
 * Sesuai aturan proyek (CLAUDE.md): harga TIDAK dibaca ulang dari
 * outlet_pricing — harga per pcs diturunkan dari angka yang tersimpan di
 * transaksi itu sendiri, jadi mengubah harga outlet tidak ikut mengubah
 * transaksi lama. `untung` yang kosong tetap kosong (tidak dikarang).
 *
 * Mengembalikan null kalau pcs lama 0 — harga per pcs tidak bisa diketahui,
 * pemanggil harus menolak perubahan pcs.
 */
export function hitungUlangVoucher(
  lama: VoucherTersimpan,
  pcsBaru: number
): { jumlah: number; untung: number | null } | null {
  if (!lama.jumlah_voucher || lama.jumlah_voucher <= 0) return null;

  const skala = (nilai: number) => Math.round((nilai * pcsBaru) / lama.jumlah_voucher);

  return {
    jumlah: skala(lama.jumlah),
    untung: lama.untung == null ? null : skala(lama.untung),
  };
}
