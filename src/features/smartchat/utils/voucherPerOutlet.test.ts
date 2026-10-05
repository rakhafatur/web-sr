import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import {
  hariAwalMingguOutlet,
  rentangMinggu,
  kelompokkanPerOutlet,
  SENIN,
  SELASA,
} from './voucherPerOutlet';
import type { VoucherRow } from '../../transaction/utils/rekapVoucher';

const fmt = (r: { awal: dayjs.Dayjs; akhir: dayjs.Dayjs }) =>
  `${r.awal.format('YYYY-MM-DD')}..${r.akhir.format('YYYY-MM-DD')}`;

describe('hariAwalMingguOutlet', () => {
  it('Travel memakai minggu Senin–Minggu', () => {
    expect(hariAwalMingguOutlet('Travel')).toBe(SENIN);
    expect(hariAwalMingguOutlet('  travel ')).toBe(SENIN);
  });

  it('Royal, SA, dan outlet lain memakai minggu operasional SR (Selasa–Senin)', () => {
    expect(hariAwalMingguOutlet('Royal')).toBe(SELASA);
    expect(hariAwalMingguOutlet('SA')).toBe(SELASA);
    expect(hariAwalMingguOutlet('Outlet Baru')).toBe(SELASA);
  });
});

describe('rentangMinggu', () => {
  // 2026-10-05 Senin, 2026-10-06 Selasa, 2026-10-04 Minggu.
  it('minggu Selasa–Senin dilihat pada hari Senin = minggu yang dimulai Selasa lalu', () => {
    expect(fmt(rentangMinggu(SELASA, 0, dayjs('2026-10-05')))).toBe('2026-09-29..2026-10-05');
  });

  it('minggu Selasa–Senin dilihat pada hari Selasa = dimulai hari itu', () => {
    expect(fmt(rentangMinggu(SELASA, 0, dayjs('2026-10-06')))).toBe('2026-10-06..2026-10-12');
  });

  it('minggu Senin–Minggu dilihat pada hari Senin = dimulai hari itu', () => {
    expect(fmt(rentangMinggu(SENIN, 0, dayjs('2026-10-05')))).toBe('2026-10-05..2026-10-11');
  });

  it('minggu Senin–Minggu dilihat pada hari Minggu = Senin sebelumnya s/d hari itu', () => {
    expect(fmt(rentangMinggu(SENIN, 0, dayjs('2026-10-04')))).toBe('2026-09-28..2026-10-04');
  });

  it('minggu lalu = mundur tepat 7 hari', () => {
    expect(fmt(rentangMinggu(SENIN, 1, dayjs('2026-10-05')))).toBe('2026-09-28..2026-10-04');
    expect(fmt(rentangMinggu(SELASA, 1, dayjs('2026-10-05')))).toBe('2026-09-22..2026-09-28');
  });
});

const baris = (outlet: string | null, tanggal: string, pcs = 1, outletLadies = 'X'): VoucherRow => ({
  jumlah: pcs * 150_000,
  jumlah_voucher: pcs,
  outlet,
  untung: pcs * 75_000,
  tanggal,
  ladies: { id: 'l', nama_ladies: 'L', nama_outlet: outletLadies },
});

describe('kelompokkanPerOutlet', () => {
  it('setiap outlet di daftar selalu ada, walau tanpa transaksi', () => {
    const hasil = kelompokkanPerOutlet([baris('Royal', '2026-10-01')], ['Royal', 'SA', 'Travel']);
    expect([...hasil.keys()]).toEqual(['Royal', 'SA', 'Travel']);
    expect(hasil.get('SA')).toEqual([]);
    expect(hasil.get('Royal')).toHaveLength(1);
  });

  it('memakai outlet yang tersimpan di transaksi, bukan outlet ladies saat ini', () => {
    const hasil = kelompokkanPerOutlet([baris('SA', '2026-10-01', 1, 'Royal')], ['Royal', 'SA']);
    expect(hasil.get('SA')).toHaveLength(1);
    expect(hasil.get('Royal')).toEqual([]);
  });

  it('outlet di luar daftar (mis. sudah nonaktif) tetap ikut di belakang', () => {
    const hasil = kelompokkanPerOutlet([baris('Lama', '2026-10-01')], ['Royal']);
    expect([...hasil.keys()]).toEqual(['Royal', 'Lama']);
  });
});
