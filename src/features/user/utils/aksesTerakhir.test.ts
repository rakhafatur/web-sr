import { describe, expect, it } from 'vitest';
import { formatAksesLengkap, formatAksesTerakhir } from './aksesTerakhir';

// Semua waktu dibuat dari waktu lokal supaya test tidak bergantung zona waktu mesin.
const sekarang = new Date(2026, 10, 22, 15, 30); // Minggu, 22 Nov 2026 15.30
const iso = (...a: [number, number, number, number, number]) => new Date(...a).toISOString();

describe('formatAksesTerakhir', () => {
  it('null / tidak valid → Belum tercatat', () => {
    expect(formatAksesTerakhir(null, sekarang)).toBe('Belum tercatat');
    expect(formatAksesTerakhir('bukan-tanggal', sekarang)).toBe('Belum tercatat');
  });

  it('kurang dari semenit, termasuk jam device yang lebih cepat → Baru saja', () => {
    expect(formatAksesTerakhir(iso(2026, 10, 22, 15, 30), sekarang)).toBe('Baru saja');
    expect(formatAksesTerakhir(iso(2026, 10, 22, 15, 32), sekarang)).toBe('Baru saja');
  });

  it('di bawah sejam → menit lalu', () => {
    expect(formatAksesTerakhir(iso(2026, 10, 22, 15, 18), sekarang)).toBe('12 menit lalu');
    expect(formatAksesTerakhir(iso(2026, 10, 22, 14, 31), sekarang)).toBe('59 menit lalu');
  });

  it('lebih dari sejam di hari yang sama → Hari ini + jam', () => {
    expect(formatAksesTerakhir(iso(2026, 10, 22, 9, 5), sekarang)).toMatch(/^Hari ini, 09[.:]05$/);
  });

  it('kemarin → Kemarin + jam, walau selisihnya kurang dari 24 jam', () => {
    expect(formatAksesTerakhir(iso(2026, 10, 21, 23, 50), sekarang)).toMatch(/^Kemarin, 23[.:]50$/);
  });

  it('2–6 hari → hari lalu', () => {
    expect(formatAksesTerakhir(iso(2026, 10, 19, 8, 0), sekarang)).toBe('3 hari lalu');
    expect(formatAksesTerakhir(iso(2026, 10, 16, 8, 0), sekarang)).toBe('6 hari lalu');
  });

  it('seminggu atau lebih → tanggal pendek', () => {
    const hasil = formatAksesTerakhir(iso(2026, 2, 5, 8, 0), sekarang);
    expect(hasil).toContain('2026');
    expect(hasil).toMatch(/^5 /);
  });
});

describe('formatAksesLengkap', () => {
  it('null → null', () => {
    expect(formatAksesLengkap(null)).toBeNull();
  });

  it('memuat hari, tanggal, dan jam', () => {
    const hasil = formatAksesLengkap(iso(2026, 10, 22, 14, 20));
    expect(hasil).toContain('22 November 2026');
    expect(hasil).toMatch(/pukul 14[.:]20$/);
  });
});
