/**
 * Agregasi Rekap Voucher — mengelompokkan transaksi voucher per outlet, lalu
 * per ladies di dalamnya, sekaligus menjumlahkan total keseluruhan.
 *
 * Dipisah dari komponen supaya bisa diuji: angka dari fungsi ini yang tampil
 * di laporan rekap dan dipakai untuk bagi hasil, jadi kesalahannya mahal.
 */

/** Baris voucher apa adanya dari Supabase (sudah termasuk relasi ladies). */
export type VoucherRow = {
  jumlah: number;
  jumlah_voucher: number;
  outlet: string | null;
  untung: number | null;
  tanggal: string;
  ladies: {
    id: string;
    nama_ladies: string;
    nama_outlet: string;
  } | null;
};

/** Satu baris rekap per ladies dalam sebuah outlet. */
export type LadiesRekap = {
  nama_ladies: string;
  totalVoucher: number;
  totalNominal: number;
  totalUntung: number;
};

export type OutletGroup = {
  outlet: string;
  data: LadiesRekap[];
};

export type RekapVoucher = {
  perOutlet: OutletGroup[];
  totalVoucher: number;
  totalNominal: number;
  totalUntung: number;
};

/**
 * Untung per baris. Transaksi lama (dibuat sebelum kolom `untung` ada) bernilai
 * null — untuk itu dipakai tarif lama yang berlaku saat transaksi tersebut
 * dibuat, yaitu 75.000 per pcs. JANGAN ganti dengan tarif yang berlaku
 * sekarang: itu akan diam-diam mengubah angka bagi hasil bulan-bulan lalu.
 */
const UNTUNG_PER_PCS_LAMA = 75_000;

export const untungBaris = (v: Pick<VoucherRow, 'untung' | 'jumlah_voucher'>): number =>
  v.untung != null ? Number(v.untung) : Number(v.jumlah_voucher || 0) * UNTUNG_PER_PCS_LAMA;

/**
 * Outlet sebuah transaksi diambil dari kolom `outlet` yang di-snapshot ke baris
 * transaksinya. Baris lama belum punya itu, jadi jatuh ke outlet ladies saat
 * ini sebagai perkiraan terbaik. Urutan ini penting: kalau `ladies.nama_outlet`
 * didahulukan, transaksi lama akan ikut pindah outlet setiap kali ladies-nya
 * dipindahkan.
 */
export const outletBaris = (v: VoucherRow): string =>
  v.outlet || v.ladies?.nama_outlet || 'Tanpa Outlet';

export function agregasiRekapVoucher(vouchers: VoucherRow[]): RekapVoucher {
  const grouped: Record<string, OutletGroup> = {};

  let totalVoucher = 0;
  let totalNominal = 0;
  let totalUntung = 0;

  for (const v of vouchers) {
    // Baris tanpa relasi ladies dilewati — tidak bisa dimasukkan ke rekap
    // per-ladies, dan menghitungnya ke total saja akan bikin total tidak
    // cocok dengan penjumlahan barisnya.
    if (!v.ladies) continue;

    const outlet = outletBaris(v);
    const nama = v.ladies.nama_ladies;
    const nominal = Number(v.jumlah);
    const pcs = Number(v.jumlah_voucher || 0);
    const untung = untungBaris(v);

    totalVoucher += pcs;
    totalNominal += nominal;
    totalUntung += untung;

    if (!grouped[outlet]) {
      grouped[outlet] = { outlet, data: [] };
    }

    const existing = grouped[outlet].data.find((d) => d.nama_ladies === nama);

    if (existing) {
      existing.totalVoucher += pcs;
      existing.totalNominal += nominal;
      existing.totalUntung += untung;
    } else {
      grouped[outlet].data.push({
        nama_ladies: nama,
        totalVoucher: pcs,
        totalNominal: nominal,
        totalUntung: untung,
      });
    }
  }

  return {
    perOutlet: Object.values(grouped),
    totalVoucher,
    totalNominal,
    totalUntung,
  };
}

/** Total per outlet — dipakai di header & footer tiap kartu outlet. */
export function totalPerOutlet(group: OutletGroup) {
  return group.data.reduce(
    (acc, d) => ({
      totalVoucher: acc.totalVoucher + d.totalVoucher,
      totalNominal: acc.totalNominal + d.totalNominal,
      totalUntung: acc.totalUntung + d.totalUntung,
    }),
    { totalVoucher: 0, totalNominal: 0, totalUntung: 0 }
  );
}
