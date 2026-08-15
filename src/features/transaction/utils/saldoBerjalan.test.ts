import { describe, it, expect } from 'vitest';
import { hitungSaldoBerjalan, saldoAkhir, type SaldoRow } from './saldoBerjalan';

/** Pembantu ringkas supaya tiap kasus uji fokus ke angkanya saja. */
const pemasukan = (tanggal: string, jumlah: number): SaldoRow => ({
  tanggal,
  keterangan: 'masuk',
  voucher: '',
  pemasukan: jumlah,
  pengeluaran: '',
  saldo: 0,
});

const pengeluaran = (tanggal: string, jumlah: number): SaldoRow => ({
  tanggal,
  keterangan: 'keluar',
  voucher: '',
  pemasukan: '',
  pengeluaran: jumlah,
  saldo: 0,
});

describe('hitungSaldoBerjalan', () => {
  it('mengawali dengan baris saldo awal, meski tidak ada transaksi', () => {
    const rows = hitungSaldoBerjalan(250_000, []);

    expect(rows).toHaveLength(1);
    expect(rows[0].tanggal).toBe('Sisa Kasbon');
    expect(rows[0].saldo).toBe(250_000);
    // Baris pembuka tidak boleh membawa nominal apa pun.
    expect(rows[0].pemasukan).toBe('');
    expect(rows[0].pengeluaran).toBe('');
  });

  it('menambah saldo untuk pemasukan dan mengurangi untuk pengeluaran', () => {
    const rows = hitungSaldoBerjalan(0, [
      pemasukan('2026-01-05', 600_000),
      pengeluaran('2026-01-10', 150_000),
    ]);

    expect(rows.map((r) => r.saldo)).toEqual([0, 600_000, 450_000]);
  });

  it('mengurutkan transaksi berdasarkan tanggal, bukan urutan masuknya', () => {
    // Sengaja dimasukkan terbalik — di app, 4 sumber transaksi digabung
    // lewat Promise.all sehingga urutan aslinya memang acak.
    const rows = hitungSaldoBerjalan(0, [
      pengeluaran('2026-01-20', 100_000),
      pemasukan('2026-01-01', 500_000),
      pengeluaran('2026-01-10', 200_000),
    ]);

    expect(rows.map((r) => r.tanggal)).toEqual([
      'Sisa Kasbon',
      '2026-01-01',
      '2026-01-10',
      '2026-01-20',
    ]);
    expect(rows.map((r) => r.saldo)).toEqual([0, 500_000, 300_000, 200_000]);
  });

  it('tidak mengubah array transaksi milik pemanggil', () => {
    const transaksi = [pemasukan('2026-02-09', 1), pemasukan('2026-02-01', 2)];
    const sebelum = transaksi.map((t) => t.tanggal);

    hitungSaldoBerjalan(0, transaksi);

    expect(transaksi.map((t) => t.tanggal)).toEqual(sebelum);
  });

  it('memperlakukan kolom nominal kosong sebagai nol', () => {
    const rows = hitungSaldoBerjalan(100_000, [
      { tanggal: '2026-03-01', keterangan: '', voucher: '', pemasukan: '', pengeluaran: '', saldo: 0 },
    ]);

    expect(rows[1].saldo).toBe(100_000);
  });

  it('meneruskan saldo awal negatif (kasbon melebihi pemasukan bulan lalu)', () => {
    const rows = hitungSaldoBerjalan(-500_000, [pemasukan('2026-04-02', 200_000)]);

    expect(rows[0].saldo).toBe(-500_000);
    expect(rows[1].saldo).toBe(-300_000);
  });

  it('bisa berakhir negatif kalau pengeluaran melebihi pemasukan', () => {
    const rows = hitungSaldoBerjalan(0, [
      pemasukan('2026-05-01', 150_000),
      pengeluaran('2026-05-02', 500_000),
    ]);

    expect(saldoAkhir(rows)).toBe(-350_000);
  });

  it('mempertahankan kolom lain apa adanya (voucher & keterangan)', () => {
    const rows = hitungSaldoBerjalan(0, [
      {
        tanggal: '2026-06-01',
        keterangan: 'Voucher',
        voucher: 4,
        pemasukan: 600_000,
        pengeluaran: '',
        saldo: 0,
      },
    ]);

    expect(rows[1].voucher).toBe(4);
    expect(rows[1].keterangan).toBe('Voucher');
  });

  it('menerima label pembuka khusus', () => {
    const rows = hitungSaldoBerjalan(0, [], 'Saldo Awal');
    expect(rows[0].tanggal).toBe('Saldo Awal');
  });
});

describe('saldoAkhir', () => {
  it('mengambil saldo baris terakhir — nilai yang disimpan saat tutup buku', () => {
    const rows = hitungSaldoBerjalan(1_000_000, [
      pengeluaran('2026-07-03', 250_000),
      pemasukan('2026-07-08', 100_000),
    ]);

    expect(saldoAkhir(rows)).toBe(850_000);
  });

  it('mengembalikan 0 untuk daftar kosong, bukan undefined', () => {
    expect(saldoAkhir([])).toBe(0);
  });

  it('sama dengan saldo awal kalau tidak ada transaksi sama sekali', () => {
    expect(saldoAkhir(hitungSaldoBerjalan(75_000, []))).toBe(75_000);
  });
});
