import type { SaldoRow } from './saldoBerjalan';

/**
 * Ringkasan keuangan satu periode Buku Kuning — angka-angka yang tampil di
 * bagian "Ringkasan Keuangan" pada PDF.
 *
 * Dipisah dari kode cetak supaya bisa diuji. Beberapa pemisahannya bergantung
 * pada teks `keterangan`, bukan kolom terpisah — lihat catatan di bawah.
 */
export type TotalBukuKuning = {
  /** Jumlah pcs voucher (kolom `voucher` hanya terisi pada baris voucher). */
  totalVoucher: number;
  /** Rupiah yang masuk dari voucher saja. */
  totalPemasukanVoucher: number;
  /** Pengeluaran selain dokter — praktisnya kasbon. */
  totalPengeluaran: number;
  /** Pengeluaran khusus dokter. */
  totalDokter: number;
  /** Pemasukan selain voucher. */
  totalPemasukanLain: number;
  saldoAwal: number;
  saldoAkhir: number;
};

/**
 * Baris dokter ditandai lewat awalan teks pada `keterangan` ("Dokter - ...")
 * dan baris voucher lewat keterangan persis "Voucher" — keduanya dibentuk di
 * query Buku Kuning. Ini rapuh terhadap perubahan teks, jadi kalau format
 * keterangan diubah, fungsi ini (dan test-nya) harus ikut diubah.
 */
const PREFIX_DOKTER = 'Dokter -';
const KETERANGAN_VOUCHER = 'Voucher';

const angka = (nilai: number | string): number =>
  typeof nilai === 'number' ? nilai : 0;

export function hitungTotalBukuKuning(rows: SaldoRow[]): TotalBukuKuning {
  const isDokter = (r: SaldoRow) => !!r.keterangan?.startsWith(PREFIX_DOKTER);
  const isVoucher = (r: SaldoRow) => r.keterangan === KETERANGAN_VOUCHER;

  return {
    totalVoucher: rows.reduce((sum, r) => sum + angka(r.voucher), 0),

    totalPemasukanVoucher: rows
      .filter(isVoucher)
      .reduce((sum, r) => sum + angka(r.pemasukan), 0),

    totalPengeluaran: rows
      .filter((r) => !isDokter(r))
      .reduce((sum, r) => sum + angka(r.pengeluaran), 0),

    totalDokter: rows
      .filter(isDokter)
      .reduce((sum, r) => sum + angka(r.pengeluaran), 0),

    totalPemasukanLain: rows
      .filter((r) => !isVoucher(r))
      .reduce((sum, r) => sum + angka(r.pemasukan), 0),

    saldoAwal: rows[0]?.saldo || 0,
    saldoAkhir: rows[rows.length - 1]?.saldo || 0,
  };
}
