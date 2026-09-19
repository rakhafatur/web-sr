import { describe, expect, it } from 'vitest';
import { formatRupiah, formatRupiahPenuh } from './uang';

describe('formatRupiah', () => {
  it('memakai titik sebagai pemisah ribuan', () => {
    expect(formatRupiah(2700000)).toBe('2.700.000');
    expect(formatRupiah(450000)).toBe('450.000');
    expect(formatRupiah(1000)).toBe('1.000');
  });

  it('tidak menyertakan awalan Rp', () => {
    expect(formatRupiah(1000)).not.toContain('Rp');
  });

  it('menangani nol', () => {
    expect(formatRupiah(0)).toBe('0');
  });

  it('membulatkan pecahan — rupiah tidak punya sen di aplikasi ini', () => {
    expect(formatRupiah(1000.4)).toBe('1.000');
    expect(formatRupiah(1000.6)).toBe('1.001');
  });

  it('mengembalikan nilai absolut — tanda dirender terpisah', () => {
    expect(formatRupiah(-450000)).toBe('450.000');
  });

  it('tahan terhadap nilai tidak sah, tidak memuntahkan NaN ke layar', () => {
    expect(formatRupiah(Number.NaN)).toBe('0');
    expect(formatRupiah(Number.POSITIVE_INFINITY)).toBe('0');
  });
});

describe('formatRupiahPenuh', () => {
  it('menyertakan awalan Rp dengan spasi', () => {
    expect(formatRupiahPenuh(2700000)).toBe('Rp 2.700.000');
  });

  it('menyertakan tanda minus untuk nilai negatif', () => {
    expect(formatRupiahPenuh(-200000)).toBe('−Rp 200.000');
  });

  it('tidak memberi tanda pada nol', () => {
    expect(formatRupiahPenuh(0)).toBe('Rp 0');
  });
});
