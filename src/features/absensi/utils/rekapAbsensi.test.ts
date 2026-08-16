import { describe, it, expect } from 'vitest';
import { hitungRekapAbsensi, STATUS_ABSENSI } from './rekapAbsensi';

describe('hitungRekapAbsensi', () => {
  it('mengembalikan nol untuk semua status kalau belum ada absensi', () => {
    expect(hitungRekapAbsensi([])).toEqual({ KERJA: 0, MENS: 0, OFF: 0, SAKIT: 0 });
  });

  it('menghitung tiap status secara terpisah', () => {
    const rekap = hitungRekapAbsensi([
      { status: 'KERJA' },
      { status: 'KERJA' },
      { status: 'MENS' },
      { status: 'OFF' },
      { status: 'SAKIT' },
      { status: 'KERJA' },
    ]);

    expect(rekap).toEqual({ KERJA: 3, MENS: 1, OFF: 1, SAKIT: 1 });
  });

  it('mengabaikan status yang tidak dikenal, bukan memasukkannya ke kategori lain', () => {
    const rekap = hitungRekapAbsensi([
      { status: 'KERJA' },
      { status: 'CUTI' },
      { status: '' },
    ]);

    expect(rekap).toEqual({ KERJA: 1, MENS: 0, OFF: 0, SAKIT: 0 });
  });

  it('membedakan huruf besar-kecil — data disimpan dalam huruf besar', () => {
    // Kalau suatu saat ada baris "kerja" huruf kecil, itu data nyasar dan
    // harus terlihat sebagai selisih, bukan diam-diam ikut terhitung.
    expect(hitungRekapAbsensi([{ status: 'kerja' }]).KERJA).toBe(0);
  });

  it('total seluruh kategori tidak melebihi jumlah baris', () => {
    const rows = [
      { status: 'KERJA' },
      { status: 'MENS' },
      { status: 'TIDAK_DIKENAL' },
    ];

    const rekap = hitungRekapAbsensi(rows);
    const total = STATUS_ABSENSI.reduce((sum, s) => sum + rekap[s], 0);

    expect(total).toBeLessThanOrEqual(rows.length);
    expect(total).toBe(2);
  });
});
