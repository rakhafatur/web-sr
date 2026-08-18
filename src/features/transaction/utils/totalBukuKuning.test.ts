import { describe, it, expect } from 'vitest';
import { hitungTotalBukuKuning } from './totalBukuKuning';
import type { SaldoRow } from './saldoBerjalan';

const pembuka = (saldo: number): SaldoRow => ({
  tanggal: 'Sisa Kasbon',
  keterangan: '',
  voucher: '',
  pemasukan: '',
  pengeluaran: '',
  saldo,
});

const voucher = (pcs: number, jumlah: number, saldo: number): SaldoRow => ({
  tanggal: '2026-01-05',
  keterangan: 'Voucher',
  voucher: pcs,
  pemasukan: jumlah,
  pengeluaran: '',
  saldo,
});

const kasbon = (jumlah: number, saldo: number): SaldoRow => ({
  tanggal: '2026-01-10',
  keterangan: 'Kasbon Admin',
  voucher: '',
  pemasukan: '',
  pengeluaran: jumlah,
  saldo,
});

const dokter = (jumlah: number, saldo: number): SaldoRow => ({
  tanggal: '2026-01-12',
  keterangan: 'Dokter - Spekulo Januari',
  voucher: '',
  pemasukan: '',
  pengeluaran: jumlah,
  saldo,
});

const pemasukanLain = (jumlah: number, saldo: number): SaldoRow => ({
  tanggal: '2026-01-15',
  keterangan: 'Fee Anak Masuk',
  voucher: '',
  pemasukan: jumlah,
  pengeluaran: '',
  saldo,
});

describe('hitungTotalBukuKuning', () => {
  it('mengembalikan nol untuk daftar kosong, bukan undefined', () => {
    expect(hitungTotalBukuKuning([])).toEqual({
      totalVoucher: 0,
      totalPemasukanVoucher: 0,
      totalPengeluaran: 0,
      totalDokter: 0,
      totalPemasukanLain: 0,
      saldoAwal: 0,
      saldoAkhir: 0,
    });
  });

  it('menjumlahkan pcs voucher dari kolom voucher', () => {
    const total = hitungTotalBukuKuning([
      pembuka(0),
      voucher(4, 600_000, 600_000),
      voucher(2, 300_000, 900_000),
    ]);

    expect(total.totalVoucher).toBe(6);
    expect(total.totalPemasukanVoucher).toBe(900_000);
  });

  it('memisahkan pengeluaran dokter dari kasbon', () => {
    const total = hitungTotalBukuKuning([
      pembuka(0),
      kasbon(500_000, -500_000),
      dokter(185_000, -685_000),
    ]);

    expect(total.totalPengeluaran).toBe(500_000);
    expect(total.totalDokter).toBe(185_000);
  });

  it('memisahkan pemasukan lain dari pemasukan voucher', () => {
    const total = hitungTotalBukuKuning([
      pembuka(0),
      voucher(1, 150_000, 150_000),
      pemasukanLain(350_000, 500_000),
    ]);

    expect(total.totalPemasukanVoucher).toBe(150_000);
    expect(total.totalPemasukanLain).toBe(350_000);
  });

  it('mengambil saldo awal dari baris pembuka dan saldo akhir dari baris terakhir', () => {
    const total = hitungTotalBukuKuning([
      pembuka(-250_000),
      voucher(2, 300_000, 50_000),
      kasbon(100_000, -50_000),
    ]);

    expect(total.saldoAwal).toBe(-250_000);
    expect(total.saldoAkhir).toBe(-50_000);
  });

  it('baris dokter tidak ikut terhitung sebagai pengeluaran biasa', () => {
    // Kalau filternya terbalik, kasbon dan dokter akan saling tertukar dan
    // ringkasan PDF menampilkan angka yang salah di dua baris sekaligus.
    const total = hitungTotalBukuKuning([pembuka(0), dokter(185_000, -185_000)]);

    expect(total.totalPengeluaran).toBe(0);
    expect(total.totalDokter).toBe(185_000);
  });

  it('baris pembuka tidak menambah nominal apa pun', () => {
    const total = hitungTotalBukuKuning([pembuka(1_000_000)]);

    expect(total.totalVoucher).toBe(0);
    expect(total.totalPemasukanVoucher).toBe(0);
    expect(total.totalPengeluaran).toBe(0);
    expect(total.totalPemasukanLain).toBe(0);
    // Tapi saldonya tetap terbaca sebagai saldo awal & akhir.
    expect(total.saldoAwal).toBe(1_000_000);
    expect(total.saldoAkhir).toBe(1_000_000);
  });

  it('pemasukan voucher + pemasukan lain = seluruh pemasukan', () => {
    const rows = [
      pembuka(0),
      voucher(1, 150_000, 150_000),
      pemasukanLain(350_000, 500_000),
      kasbon(100_000, 400_000),
    ];

    const total = hitungTotalBukuKuning(rows);
    const seluruhPemasukan = rows.reduce(
      (sum, r) => sum + (typeof r.pemasukan === 'number' ? r.pemasukan : 0),
      0
    );

    expect(total.totalPemasukanVoucher + total.totalPemasukanLain).toBe(seluruhPemasukan);
  });
});
