import { describe, it, expect } from 'vitest';
import {
  pilihTier,
  perluPilihTier,
  hitungJumlahVoucher,
  hitungUntungVoucher,
} from './pilihTier';
import type { OutletPricingTier } from '../hooks/useOutletPricing';

// Angka di bawah mengikuti konfigurasi asli di tabel `outlet_pricing`.
const FLAT: OutletPricingTier = { tier_name: null, harga_ladies: 150_000, untung: 75_000 };
const SINGLE: OutletPricingTier = { tier_name: 'Single', harga_ladies: 105_000, untung: 45_000 };
const DOUBLE: OutletPricingTier = { tier_name: 'Double', harga_ladies: 95_000, untung: 30_000 };

describe('pilihTier', () => {
  it('memakai satu-satunya tier untuk outlet tanpa tier (Royal/SA)', () => {
    expect(pilihTier([FLAT], null)).toEqual(FLAT);
  });

  it('memakai tier pertama sebagai default kalau user belum memilih', () => {
    expect(pilihTier([SINGLE, DOUBLE], null)).toEqual(SINGLE);
  });

  it('memakai tier yang dipilih user', () => {
    expect(pilihTier([SINGLE, DOUBLE], 'Double')).toEqual(DOUBLE);
  });

  it('jatuh ke tier pertama kalau nama tier pilihan tidak ada lagi', () => {
    // Bisa terjadi kalau admin menghapus/menonaktifkan tier sementara form terbuka.
    expect(pilihTier([SINGLE, DOUBLE], 'Triple')).toEqual(SINGLE);
  });

  it('mengembalikan undefined kalau outlet belum punya konfigurasi harga', () => {
    // Ini yang harus memblokir penyimpanan — jangan pernah menebak harga.
    expect(pilihTier([], null)).toBeUndefined();
    expect(pilihTier([], 'Single')).toBeUndefined();
  });
});

describe('perluPilihTier', () => {
  it('tidak menampilkan pilihan untuk outlet berharga tunggal', () => {
    expect(perluPilihTier([FLAT])).toBe(false);
  });

  it('menampilkan pilihan untuk outlet bertier', () => {
    expect(perluPilihTier([SINGLE, DOUBLE])).toBe(true);
  });

  it('tetap menampilkan pilihan kalau tier bertambah jadi tiga atau lebih', () => {
    const TRIPLE: OutletPricingTier = { tier_name: 'Triple', harga_ladies: 85_000, untung: 25_000 };
    expect(perluPilihTier([SINGLE, DOUBLE, TRIPLE])).toBe(true);
  });

  it('tidak menampilkan apa-apa kalau belum ada konfigurasi', () => {
    expect(perluPilihTier([])).toBe(false);
  });
});

describe('perhitungan nominal voucher', () => {
  it('menghitung jumlah & untung untuk outlet flat', () => {
    expect(hitungJumlahVoucher(4, FLAT)).toBe(600_000);
    expect(hitungUntungVoucher(4, FLAT)).toBe(300_000);
  });

  it('menghitung Travel Single sesuai kesepakatan (105rb ladies / 45rb untung)', () => {
    expect(hitungJumlahVoucher(1, SINGLE)).toBe(105_000);
    expect(hitungUntungVoucher(1, SINGLE)).toBe(45_000);
  });

  it('menghitung Travel Double sesuai kesepakatan (95rb ladies / 30rb untung)', () => {
    expect(hitungJumlahVoucher(1, DOUBLE)).toBe(95_000);
    expect(hitungUntungVoucher(1, DOUBLE)).toBe(30_000);
  });

  it('total hasil = bagian ladies + untung, sesuai tabel bisnis', () => {
    // Single: 105 + 45 = 150rb. Double: 95 + 30 = 125rb.
    expect(hitungJumlahVoucher(1, SINGLE) + hitungUntungVoucher(1, SINGLE)).toBe(150_000);
    expect(hitungJumlahVoucher(1, DOUBLE) + hitungUntungVoucher(1, DOUBLE)).toBe(125_000);
    expect(hitungJumlahVoucher(1, FLAT) + hitungUntungVoucher(1, FLAT)).toBe(225_000);
  });

  it('menghasilkan nol untuk 0 pcs, bukan NaN', () => {
    expect(hitungJumlahVoucher(0, FLAT)).toBe(0);
    expect(hitungUntungVoucher(0, FLAT)).toBe(0);
  });
});
