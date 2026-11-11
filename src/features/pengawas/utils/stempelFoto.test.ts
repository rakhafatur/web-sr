import { describe, it, expect } from 'vitest';
import {
  formatWaktuStempel,
  ringkasAlamat,
  teksLokasi,
  teksNama,
  ukuranKeluaran,
  potongBaris,
} from './stempelFoto';

describe('formatWaktuStempel', () => {
  // 2026-11-11 14:05 waktu lokal, offset diberikan eksplisit agar tidak
  // bergantung pada zona mesin yang menjalankan test.
  const d = new Date(2026, 10, 11, 14, 5);

  it('menulis hari, tanggal, jam, dan WIB untuk UTC+7', () => {
    expect(formatWaktuStempel(d, -420)).toBe('Rabu, 11 Nov 2026 · 14:05 WIB');
  });

  it('mengenali WITA dan WIT', () => {
    expect(formatWaktuStempel(d, -480)).toMatch(/ WITA$/);
    expect(formatWaktuStempel(d, -540)).toMatch(/ WIT$/);
  });

  it('zona lain ditulis sebagai GMT±jam', () => {
    expect(formatWaktuStempel(d, 0)).toMatch(/ GMT\+0$/);
    expect(formatWaktuStempel(d, 300)).toMatch(/ GMT-5$/);
    expect(formatWaktuStempel(d, -330)).toMatch(/ GMT\+5:30$/);
  });
});

describe('ringkasAlamat', () => {
  it('menyusun jalan + nomor, kelurahan, kota', () => {
    expect(
      ringkasAlamat({
        road: 'Jalan Gajah Mada',
        house_number: '12',
        suburb: 'Taman Sari',
        city: 'Jakarta Barat',
        state: 'DKI Jakarta',
      })
    ).toBe('Jalan Gajah Mada No. 12, Taman Sari, Jakarta Barat');
  });

  it('memakai cadangan bila kolom utama kosong dan membuang duplikat', () => {
    expect(
      ringkasAlamat({ village: 'Sukamaju', county: 'Bogor', state: 'Jawa Barat' })
    ).toBe('Sukamaju, Bogor');
    expect(ringkasAlamat({ suburb: 'Kuta', town: 'Kuta', state: 'Bali' })).toBe('Kuta, Bali');
  });

  it('mengembalikan null bila tidak ada yang bisa dipakai', () => {
    expect(ringkasAlamat({})).toBeNull();
    expect(ringkasAlamat(undefined)).toBeNull();
  });
});

describe('teksLokasi', () => {
  it('nama tempat diutamakan, koordinat tidak ditampilkan', () => {
    expect(teksLokasi('Jalan A, Kota B', { lat: -6.1612345, lon: 106.8170456 })).toBe('Jalan A, Kota B');
  });

  it('koordinat jadi cadangan bila nama tempat gagal', () => {
    expect(teksLokasi(null, { lat: -6.1612345, lon: 106.8170456 })).toBe('-6.16123, 106.81705');
  });

  it('tanpa GPS sama sekali', () => {
    expect(teksLokasi(null, null)).toBe('Lokasi tidak tersedia');
  });
});

describe('teksNama', () => {
  it('nama akun + " - SR AGENT"', () => {
    expect(teksNama('Rakha')).toBe('Rakha - SR AGENT');
    expect(teksNama('  Budi Santoso ')).toBe('Budi Santoso - SR AGENT');
  });

  it('tanpa nama tetap ada penanda agensi', () => {
    expect(teksNama('')).toBe('SR AGENT');
  });
});

describe('ukuranKeluaran', () => {
  it('memperkecil sisi terpanjang ke batas, menjaga rasio', () => {
    expect(ukuranKeluaran(4032, 3024, 1920)).toEqual({ w: 1920, h: 1440 });
    expect(ukuranKeluaran(3024, 4032, 1920)).toEqual({ w: 1440, h: 1920 });
  });

  it('tidak memperbesar foto yang sudah kecil', () => {
    expect(ukuranKeluaran(800, 600, 1920)).toEqual({ w: 800, h: 600 });
  });
});

describe('potongBaris', () => {
  // Lebar = jumlah karakter, cukup untuk menguji logika pemotongan.
  const ukur = (s: string) => s.length;

  it('membungkus per kata sesuai lebar', () => {
    expect(potongBaris('satu dua tiga empat', 9, 3, ukur)).toEqual(['satu dua', 'tiga', 'empat']);
  });

  it('membatasi jumlah baris dan memberi elipsis', () => {
    expect(potongBaris('satu dua tiga empat lima', 9, 2, ukur)).toEqual(['satu dua', 'tiga emp…']);
  });

  it('memotong kata yang lebih panjang dari satu baris', () => {
    expect(potongBaris('abcdefghijkl', 5, 1, ukur)).toEqual(['abcd…']);
  });

  it('teks kosong menghasilkan nol baris', () => {
    expect(potongBaris('   ', 10, 2, ukur)).toEqual([]);
  });
});
