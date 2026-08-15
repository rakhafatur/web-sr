/**
 * Perhitungan saldo berjalan Buku Kuning — dipakai bersama oleh Buku Kuning
 * Ladies dan Buku Kuning Pengawas.
 *
 * Sengaja dipisah dari komponen supaya bisa diuji langsung: angka terakhir
 * dari fungsi ini yang disimpan sebagai `saldo_akhir` saat tutup buku, lalu
 * jadi saldo awal bulan berikutnya. Kalau salah, kesalahannya merambat ke
 * semua bulan sesudahnya.
 */

/** Satu baris buku kuning. Kolom nominal memakai string kosong (bukan 0)
    ketika tidak berlaku untuk baris itu — mis. `pemasukan` pada baris kasbon —
    supaya sel tampil kosong di tabel, bukan "Rp0". */
export type SaldoRow = {
  tanggal: string;
  keterangan: string;
  voucher: number | string;
  pemasukan: number | string;
  pengeluaran: number | string;
  saldo: number;
};

/** Ubah nilai kolom nominal jadi angka; string kosong dianggap nol. */
const toAngka = (nilai: number | string): number =>
  nilai === '' || nilai === null || nilai === undefined ? 0 : Number(nilai);

/**
 * Urutkan transaksi berdasarkan tanggal (menaik) lalu hitung saldo berjalan,
 * diawali satu baris pembuka berisi saldo awal dari bulan sebelumnya.
 *
 * @param saldoAwal saldo akhir bulan sebelumnya (0 kalau belum pernah tutup buku)
 * @param transaksi baris transaksi bulan berjalan, urutan bebas
 * @param labelPembuka teks pada baris pembuka
 */
export function hitungSaldoBerjalan(
  saldoAwal: number,
  transaksi: SaldoRow[],
  labelPembuka = 'Sisa Kasbon'
): SaldoRow[] {
  // Salin dulu — `sort` mengubah array aslinya, dan pemanggil tidak
  // mengharapkan datanya ikut teracak.
  const urut = [...transaksi].sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  const rows: SaldoRow[] = [
    {
      tanggal: labelPembuka,
      keterangan: '',
      voucher: '',
      pemasukan: '',
      pengeluaran: '',
      saldo: saldoAwal,
    },
  ];

  let saldo = saldoAwal;

  for (const trx of urut) {
    saldo += toAngka(trx.pemasukan) - toAngka(trx.pengeluaran);
    rows.push({ ...trx, saldo });
  }

  return rows;
}

/** Saldo akhir periode — nilai inilah yang disimpan saat tutup buku. */
export function saldoAkhir(rows: SaldoRow[]): number {
  return rows.length > 0 ? rows[rows.length - 1].saldo : 0;
}
