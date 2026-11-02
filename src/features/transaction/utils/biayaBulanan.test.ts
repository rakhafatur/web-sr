import { describe, it, expect } from 'vitest';
import {
  bacaBiayaOutlet,
  biayaBelumDibuat,
  kunciBiaya,
  type BiayaOutlet,
} from './biayaBulanan';

// Angka di bawah mengikuti konfigurasi asli di tabel `outlets`.
const ROYAL: BiayaOutlet = {
  nama_outlet: 'Royal',
  kasbon_admin: 500_000,
  dokter_spekulo: 185_000,
  dokter_gigi: 50_000,
};
const TRAVEL: BiayaOutlet = {
  nama_outlet: 'Travel',
  kasbon_admin: 500_000,
  dokter_spekulo: null,
  dokter_gigi: null,
};

const TANPA_RIWAYAT = new Set<string>();

describe('biayaBelumDibuat', () => {
  it('Royal/SA kena Admin, Spekulo, dan Gigi di tabel masing-masing', () => {
    expect(biayaBelumDibuat(ROYAL, 'November 2026', 'lady-1', TANPA_RIWAYAT)).toEqual([
      { nama: 'Admin', tabel: 'kasbon', keterangan: 'Admin November 2026', jumlah: 500_000 },
      { nama: 'Spekulo', tabel: 'dokter', keterangan: 'Spekulo November 2026', jumlah: 185_000 },
      { nama: 'Gigi', tabel: 'dokter', keterangan: 'Gigi November 2026', jumlah: 50_000 },
    ]);
  });

  it('outlet lain hanya kena Admin kalau Spekulo & Gigi tidak dikenakan', () => {
    expect(biayaBelumDibuat(TRAVEL, 'November 2026', 'lady-2', TANPA_RIWAYAT)).toEqual([
      { nama: 'Admin', tabel: 'kasbon', keterangan: 'Admin November 2026', jumlah: 500_000 },
    ]);
  });

  it('hanya menyisakan biaya yang belum ada di bulan itu', () => {
    // Keadaan nyata November 2026: Admin & Spekulo sudah ter-generate sebelum
    // biaya gigi ada, jadi generate ulang cuma boleh menambah Gigi.
    const sudahAda = new Set([
      kunciBiaya('lady-1', 'Admin November 2026'),
      kunciBiaya('lady-1', 'Spekulo November 2026'),
    ]);

    expect(biayaBelumDibuat(ROYAL, 'November 2026', 'lady-1', sudahAda)).toEqual([
      { nama: 'Gigi', tabel: 'dokter', keterangan: 'Gigi November 2026', jumlah: 50_000 },
    ]);
  });

  it('riwayat ladies lain tidak menutupi biaya ladies ini', () => {
    const sudahAda = new Set([kunciBiaya('lady-lain', 'Admin November 2026')]);

    expect(biayaBelumDibuat(TRAVEL, 'November 2026', 'lady-2', sudahAda)).toHaveLength(1);
  });

  it('riwayat bulan lain tidak menutupi biaya bulan ini', () => {
    const sudahAda = new Set([kunciBiaya('lady-2', 'Admin Oktober 2026')]);

    expect(biayaBelumDibuat(TRAVEL, 'November 2026', 'lady-2', sudahAda)).toHaveLength(1);
  });

  it('Admin tanpa nominal tetap muncul bernilai 0 supaya generate terblokir', () => {
    const belumDiatur = { ...TRAVEL, kasbon_admin: null };

    expect(biayaBelumDibuat(belumDiatur, 'November 2026', 'lady-2', TANPA_RIWAYAT)).toEqual([
      { nama: 'Admin', tabel: 'kasbon', keterangan: 'Admin November 2026', jumlah: 0 },
    ]);
  });

  it('outlet tanpa konfigurasi juga terblokir, bukan dilewati diam-diam', () => {
    expect(biayaBelumDibuat(undefined, 'November 2026', 'lady-2', TANPA_RIWAYAT)).toEqual([
      { nama: 'Admin', tabel: 'kasbon', keterangan: 'Admin November 2026', jumlah: 0 },
    ]);
  });

  it('Spekulo bernilai 0 dianggap salah isi, bukan "tidak dikenakan"', () => {
    const salahIsi = { ...ROYAL, dokter_spekulo: 0 };

    const spekulo = biayaBelumDibuat(salahIsi, 'November 2026', 'lady-1', TANPA_RIWAYAT).find(
      (b) => b.nama === 'Spekulo'
    );

    expect(spekulo?.jumlah).toBe(0);
  });
});

describe('bacaBiayaOutlet', () => {
  it('membedakan kosong (tidak dikenakan) dari angka', () => {
    expect(
      bacaBiayaOutlet({
        nama_outlet: 'Travel',
        kasbon_admin: 500000,
        dokter_spekulo: null,
        dokter_gigi: null,
      })
    ).toEqual(TRAVEL);
  });

  it('mengubah kolom numeric yang datang sebagai string jadi angka', () => {
    expect(
      bacaBiayaOutlet({
        nama_outlet: 'Royal',
        kasbon_admin: '500000.00',
        dokter_spekulo: '185000.00',
        dokter_gigi: '50000.00',
      })
    ).toEqual(ROYAL);
  });
});
