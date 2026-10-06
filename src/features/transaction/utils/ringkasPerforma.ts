/**
 * Ringkasan & geometri tampilan Performa Ladies (desktop).
 *
 * Angka per ladies sudah dihitung halaman dari kolom tersimpan (`jumlah`,
 * `jumlah_voucher`) — fungsi di sini hanya menjumlahkan baris itu dan
 * menghitung posisi batang, tanpa membaca harga/konstanta apa pun.
 */

/** Bentuk minimal satu baris performa yang dipakai ringkasan. */
export type BarisPerforma = {
  voucherTotal: number;
  masuk: number;
  pendapatanVoucher: number;
  pemasukan: number;
  kasbon: number;
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
  kasbon: number;
  /** Pendapatan voucher + pemasukan lain − kasbon. */
  total: number;
};

export function ringkasPerforma(rows: BarisPerforma[]): RingkasanPerforma {
  const r = rows.reduce<Omit<RingkasanPerforma, 'voucherPerHari'>>(
    (acc, row) => {
      acc.voucherTotal += row.voucherTotal;
      acc.masuk += row.masuk;
      acc.pendapatanVoucher += row.pendapatanVoucher;
      acc.pemasukan += row.pemasukan;
      acc.kasbon += row.kasbon;
      acc.total += row.total;
      if (row.voucherTotal > 0) acc.ladiesBervoucher += 1;
      return acc;
    },
    { voucherTotal: 0, masuk: 0, pendapatanVoucher: 0, pemasukan: 0, kasbon: 0, total: 0, ladiesBervoucher: 0 }
  );

  return { ...r, voucherPerHari: r.masuk > 0 ? r.voucherTotal / r.masuk : 0 };
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
