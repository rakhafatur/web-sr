import { describe, it, expect } from 'vitest';
import { ringkasPerforma, posisiBatang, type BarisPerforma } from './ringkasPerforma';

const baris = (b: Partial<BarisPerforma>): BarisPerforma => ({
  voucherTotal: 0,
  masuk: 0,
  pendapatanVoucher: 0,
  pemasukan: 0,
  kasbon: 0,
  total: 0,
  ...b,
});

describe('ringkasPerforma', () => {
  it('mengembalikan nol semua kalau belum ada ladies', () => {
    expect(ringkasPerforma([])).toEqual({
      voucherTotal: 0,
      masuk: 0,
      voucherPerHari: 0,
      ladiesBervoucher: 0,
      pendapatanVoucher: 0,
      pemasukan: 0,
      kasbon: 0,
      total: 0,
    });
  });

  it('menjumlahkan kolom per ladies apa adanya, termasuk total yang minus', () => {
    const r = ringkasPerforma([
      baris({ voucherTotal: 10, masuk: 5, pendapatanVoucher: 1_500_000, pemasukan: 200_000, kasbon: 300_000, total: 1_400_000 }),
      baris({ voucherTotal: 0, masuk: 2, pendapatanVoucher: 0, pemasukan: 0, kasbon: 500_000, total: -500_000 }),
    ]);

    expect(r.voucherTotal).toBe(10);
    expect(r.masuk).toBe(7);
    expect(r.pendapatanVoucher).toBe(1_500_000);
    expect(r.pemasukan).toBe(200_000);
    expect(r.kasbon).toBe(800_000);
    expect(r.total).toBe(900_000);
  });

  it('total ringkasan = jumlah kolom total per baris (tidak dihitung ulang)', () => {
    // Kalau suatu saat rumus total per baris berubah, ringkasan tetap
    // mengikuti baris — bukan rumus sendiri yang bisa tidak sinkron.
    const r = ringkasPerforma([baris({ pendapatanVoucher: 100, total: 42 })]);
    expect(r.total).toBe(42);
  });

  it('voucher per hari dihitung dari total keseluruhan, bukan rata-rata per ladies', () => {
    const r = ringkasPerforma([
      baris({ voucherTotal: 10, masuk: 10 }),
      baris({ voucherTotal: 10, masuk: 1 }),
    ]);
    // 20 / 11, bukan (1 + 10) / 2
    expect(r.voucherPerHari).toBeCloseTo(20 / 11);
  });

  it('voucher per hari 0 kalau belum ada hari masuk (tanpa NaN/Infinity)', () => {
    expect(ringkasPerforma([baris({ voucherTotal: 5, masuk: 0 })]).voucherPerHari).toBe(0);
  });

  it('hanya menghitung ladies yang menjual minimal satu voucher', () => {
    const r = ringkasPerforma([baris({ voucherTotal: 3 }), baris({ voucherTotal: 0 }), baris({ voucherTotal: 1 })]);
    expect(r.ladiesBervoucher).toBe(2);
  });
});

describe('posisiBatang', () => {
  it('semua positif: garis nol di kiri, lebar sebanding nilai terbesar', () => {
    expect(posisiBatang(50, [0, 50, 100])).toEqual({ nol: 0, kiri: 0, lebar: 50 });
    expect(posisiBatang(100, [0, 50, 100])).toEqual({ nol: 0, kiri: 0, lebar: 100 });
  });

  it('ada nilai negatif: garis nol bergeser, batang negatif tumbuh ke kiri', () => {
    // domain [-100, 300] → nol di 25%
    const semua = [-100, 300];
    expect(posisiBatang(-100, semua)).toEqual({ nol: 25, kiri: 0, lebar: 25 });
    expect(posisiBatang(300, semua)).toEqual({ nol: 25, kiri: 25, lebar: 75 });
  });

  it('nilai nol tidak punya lebar', () => {
    expect(posisiBatang(0, [0, 10]).lebar).toBe(0);
  });

  it('semua nol: tidak membagi dengan nol', () => {
    expect(posisiBatang(0, [0, 0])).toEqual({ nol: 0, kiri: 0, lebar: 0 });
  });
});
