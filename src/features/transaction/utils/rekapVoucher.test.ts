import { describe, it, expect } from 'vitest';
import {
  agregasiRekapVoucher,
  totalPerOutlet,
  untungBaris,
  outletBaris,
  type VoucherRow,
} from './rekapVoucher';

/** Pembantu ringkas. `outlet`/`untung` null meniru transaksi lama yang dibuat
    sebelum kedua kolom itu ada. */
const baris = (o: {
  nama: string;
  outletLadies: string;
  pcs: number;
  jumlah: number;
  outlet?: string | null;
  untung?: number | null;
}): VoucherRow => ({
  jumlah: o.jumlah,
  jumlah_voucher: o.pcs,
  outlet: o.outlet ?? null,
  untung: o.untung ?? null,
  tanggal: '2026-01-01',
  ladies: { id: `id-${o.nama}`, nama_ladies: o.nama, nama_outlet: o.outletLadies },
});

describe('untungBaris', () => {
  it('memakai nilai untung yang tersimpan kalau ada', () => {
    expect(untungBaris({ untung: 45_000, jumlah_voucher: 1 })).toBe(45_000);
  });

  it('memakai tarif lama 75rb/pcs untuk baris yang untung-nya belum tersimpan', () => {
    expect(untungBaris({ untung: null, jumlah_voucher: 4 })).toBe(300_000);
  });

  it('menghormati untung bernilai nol, bukan menganggapnya kosong', () => {
    // 0 itu falsy — kalau dicek dengan `||` bukan `!= null`, ini akan salah
    // jadi 75rb/pcs.
    expect(untungBaris({ untung: 0, jumlah_voucher: 2 })).toBe(0);
  });
});

describe('outletBaris', () => {
  it('mengutamakan outlet yang tersimpan di baris transaksi', () => {
    const v = baris({ nama: 'A', outletLadies: 'Travel', outlet: 'Royal', pcs: 1, jumlah: 1 });
    // Ladies-nya sekarang di Travel, tapi transaksinya dulu dibuat di Royal.
    expect(outletBaris(v)).toBe('Royal');
  });

  it('jatuh ke outlet ladies untuk transaksi lama yang belum punya snapshot', () => {
    const v = baris({ nama: 'A', outletLadies: 'SA', pcs: 1, jumlah: 1 });
    expect(outletBaris(v)).toBe('SA');
  });

  it('memakai label cadangan kalau dua-duanya kosong', () => {
    const v = { ...baris({ nama: 'A', outletLadies: '', pcs: 1, jumlah: 1 }) };
    v.ladies = { id: 'x', nama_ladies: 'A', nama_outlet: '' };
    expect(outletBaris(v)).toBe('Tanpa Outlet');
  });
});

describe('agregasiRekapVoucher', () => {
  it('mengembalikan nol untuk daftar kosong', () => {
    const hasil = agregasiRekapVoucher([]);
    expect(hasil.perOutlet).toEqual([]);
    expect(hasil.totalVoucher).toBe(0);
    expect(hasil.totalNominal).toBe(0);
    expect(hasil.totalUntung).toBe(0);
  });

  it('menjumlahkan beberapa transaksi milik ladies yang sama jadi satu baris', () => {
    const hasil = agregasiRekapVoucher([
      baris({ nama: 'Mecha', outletLadies: 'SA', pcs: 2, jumlah: 300_000, untung: 150_000 }),
      baris({ nama: 'Mecha', outletLadies: 'SA', pcs: 3, jumlah: 450_000, untung: 225_000 }),
    ]);

    expect(hasil.perOutlet).toHaveLength(1);
    expect(hasil.perOutlet[0].data).toHaveLength(1);
    expect(hasil.perOutlet[0].data[0]).toEqual({
      nama_ladies: 'Mecha',
      totalVoucher: 5,
      totalNominal: 750_000,
      totalUntung: 375_000,
    });
  });

  it('memisahkan ladies berbeda di dalam outlet yang sama', () => {
    const hasil = agregasiRekapVoucher([
      baris({ nama: 'Mecha', outletLadies: 'SA', pcs: 1, jumlah: 150_000, untung: 75_000 }),
      baris({ nama: 'Jovanka', outletLadies: 'SA', pcs: 2, jumlah: 300_000, untung: 150_000 }),
    ]);

    expect(hasil.perOutlet).toHaveLength(1);
    expect(hasil.perOutlet[0].data.map((d) => d.nama_ladies)).toEqual(['Mecha', 'Jovanka']);
  });

  it('memisahkan outlet berbeda', () => {
    const hasil = agregasiRekapVoucher([
      baris({ nama: 'Mecha', outletLadies: 'SA', pcs: 1, jumlah: 150_000, untung: 75_000 }),
      baris({ nama: 'Aqila', outletLadies: 'Travel', pcs: 1, jumlah: 105_000, untung: 45_000 }),
    ]);

    expect(hasil.perOutlet.map((g) => g.outlet)).toEqual(['SA', 'Travel']);
  });

  it('mengelompokkan berdasarkan outlet tersimpan, bukan outlet ladies sekarang', () => {
    // Skenario Aqila: pindah dari Royal ke Travel. Transaksi lamanya harus
    // tetap tercatat di Royal.
    const hasil = agregasiRekapVoucher([
      baris({ nama: 'Aqila', outletLadies: 'Travel', outlet: 'Royal', pcs: 1, jumlah: 150_000, untung: 75_000 }),
      baris({ nama: 'Aqila', outletLadies: 'Travel', outlet: 'Travel', pcs: 1, jumlah: 105_000, untung: 45_000 }),
    ]);

    expect(hasil.perOutlet.map((g) => g.outlet).sort()).toEqual(['Royal', 'Travel']);
  });

  it('melewati baris yang tidak punya relasi ladies', () => {
    const tanpaLadies: VoucherRow = {
      jumlah: 999_000,
      jumlah_voucher: 9,
      outlet: 'SA',
      untung: 999,
      tanggal: '2026-01-01',
      ladies: null,
    };

    const hasil = agregasiRekapVoucher([
      baris({ nama: 'Mecha', outletLadies: 'SA', pcs: 1, jumlah: 150_000, untung: 75_000 }),
      tanpaLadies,
    ]);

    // Baris tanpa ladies tidak boleh ikut total, supaya total tetap cocok
    // dengan penjumlahan baris yang tampil.
    expect(hasil.totalVoucher).toBe(1);
    expect(hasil.totalNominal).toBe(150_000);
    expect(hasil.totalUntung).toBe(75_000);
  });

  it('total keseluruhan sama dengan penjumlahan semua baris', () => {
    const hasil = agregasiRekapVoucher([
      baris({ nama: 'Mecha', outletLadies: 'SA', pcs: 2, jumlah: 300_000, untung: 150_000 }),
      baris({ nama: 'Jovanka', outletLadies: 'Royal', pcs: 3, jumlah: 450_000, untung: 225_000 }),
      baris({ nama: 'Aqila', outletLadies: 'Travel', outlet: 'Travel', pcs: 1, jumlah: 105_000, untung: 45_000 }),
    ]);

    const jumlahDariBaris = hasil.perOutlet
      .flatMap((g) => g.data)
      .reduce(
        (acc, d) => ({
          pcs: acc.pcs + d.totalVoucher,
          nominal: acc.nominal + d.totalNominal,
          untung: acc.untung + d.totalUntung,
        }),
        { pcs: 0, nominal: 0, untung: 0 }
      );

    expect(jumlahDariBaris.pcs).toBe(hasil.totalVoucher);
    expect(jumlahDariBaris.nominal).toBe(hasil.totalNominal);
    expect(jumlahDariBaris.untung).toBe(hasil.totalUntung);
  });

  it('memakai tarif lama untuk campuran transaksi lama dan baru', () => {
    const hasil = agregasiRekapVoucher([
      // lama: untung belum tersimpan -> 2 x 75rb
      baris({ nama: 'Mecha', outletLadies: 'SA', pcs: 2, jumlah: 300_000 }),
      // baru: untung tersimpan
      baris({ nama: 'Mecha', outletLadies: 'SA', pcs: 1, jumlah: 150_000, untung: 75_000 }),
    ]);

    expect(hasil.totalUntung).toBe(225_000);
  });
});

describe('totalPerOutlet', () => {
  it('menjumlahkan seluruh ladies dalam satu outlet', () => {
    const hasil = agregasiRekapVoucher([
      baris({ nama: 'Mecha', outletLadies: 'SA', pcs: 2, jumlah: 300_000, untung: 150_000 }),
      baris({ nama: 'Jovanka', outletLadies: 'SA', pcs: 1, jumlah: 150_000, untung: 75_000 }),
    ]);

    expect(totalPerOutlet(hasil.perOutlet[0])).toEqual({
      totalVoucher: 3,
      totalNominal: 450_000,
      totalUntung: 225_000,
    });
  });

  it('mengembalikan nol untuk outlet tanpa data', () => {
    expect(totalPerOutlet({ outlet: 'Kosong', data: [] })).toEqual({
      totalVoucher: 0,
      totalNominal: 0,
      totalUntung: 0,
    });
  });
});
