/**
 * Ringkasan & geometri tampilan Performa Ladies (desktop).
 *
 * Angka per ladies sudah dihitung halaman dari kolom tersimpan (`jumlah`,
 * `jumlah_voucher`) — fungsi di sini hanya menjumlahkan baris itu dan
 * menghitung posisi batang, tanpa membaca harga/konstanta apa pun.
 */

/**
 * Bersih ladies sebulan, dari sudut pandang ladies — sama dengan arah
 * Buku Kuning: voucher (bagian ladies) & pemasukan lain menambah, kasbon &
 * dokter mengurangi. Minus = pengeluaran ladies bulan itu lebih besar dari
 * yang didapat. (Untung agency ada di Rekap Voucher, bukan di sini.)
 */
export function hitungBersihLadies(row: {
  pendapatanVoucher: number;
  pemasukan: number;
  kasbon: number;
  dokter: number;
}): number {
  return row.pendapatanVoucher + row.pemasukan - row.kasbon - row.dokter;
}

/** Bentuk minimal satu baris performa yang dipakai ringkasan. */
export type BarisPerforma = {
  voucherTotal: number;
  masuk: number;
  pendapatanVoucher: number;
  pemasukan: number;
  kasbon: number;
  dokter: number;
  total: number;
};

export type RingkasanPerforma = {
  voucherTotal: number;
  masuk: number;
  /** Voucher per hari masuk, seluruh ladies (0 kalau belum ada hari masuk). */
  voucherPerHari: number;
  /** Jumlah ladies yang menjual minimal satu voucher bulan itu. */
  ladiesBervoucher: number;
  pendapatanVoucher: number;
  pemasukan: number;
  /** Yang didapat ladies: bagian voucher + pemasukan lain. */
  didapat: number;
  kasbon: number;
  dokter: number;
  /** Jumlah kolom `total` (bersih) tiap ladies. */
  total: number;
  /** Jumlah ladies yang bersihnya minus bulan itu. */
  ladiesMinus: number;
};

export function ringkasPerforma(rows: BarisPerforma[]): RingkasanPerforma {
  const r = rows.reduce<Omit<RingkasanPerforma, 'voucherPerHari' | 'didapat'>>(
    (acc, row) => {
      acc.voucherTotal += row.voucherTotal;
      acc.masuk += row.masuk;
      acc.pendapatanVoucher += row.pendapatanVoucher;
      acc.pemasukan += row.pemasukan;
      acc.kasbon += row.kasbon;
      acc.dokter += row.dokter;
      acc.total += row.total;
      if (row.voucherTotal > 0) acc.ladiesBervoucher += 1;
      if (row.total < 0) acc.ladiesMinus += 1;
      return acc;
    },
    {
      voucherTotal: 0,
      masuk: 0,
      pendapatanVoucher: 0,
      pemasukan: 0,
      kasbon: 0,
      dokter: 0,
      total: 0,
      ladiesBervoucher: 0,
      ladiesMinus: 0,
    }
  );

  return {
    ...r,
    voucherPerHari: r.masuk > 0 ? r.voucherTotal / r.masuk : 0,
    didapat: r.pendapatanVoucher + r.pemasukan,
  };
}

/**
 * Posisi batang horizontal dalam persen lebar trek, dengan garis nol di
 * dalam domain [min(0, terkecil), max(0, terbesar)] — jadi nilai negatif
 * tumbuh ke kiri dari garis nol, positif ke kanan.
 */
export function posisiBatang(
  nilai: number,
  semuaNilai: number[]
): { nol: number; kiri: number; lebar: number } {
  const bawah = Math.min(0, ...semuaNilai);
  const atas = Math.max(0, ...semuaNilai);
  const rentang = atas - bawah;

  if (rentang === 0) return { nol: 0, kiri: 0, lebar: 0 };

  const ke = (v: number) => ((v - bawah) / rentang) * 100;
  const nol = ke(0);
  const ujung = ke(nilai);

  return { nol, kiri: Math.min(nol, ujung), lebar: Math.abs(ujung - nol) };
}
