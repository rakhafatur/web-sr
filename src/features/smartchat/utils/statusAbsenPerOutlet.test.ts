import { describe, it, expect } from 'vitest';
import { statusAbsenPerOutlet } from './statusAbsenPerOutlet';

const lady = (id: string, nama_outlet: string | null) => ({
  id,
  nama_ladies: `Nama ${id}`,
  nama_outlet,
});

describe('statusAbsenPerOutlet', () => {
  it('menghitung status tiap outlet secara terpisah', () => {
    const hasil = statusAbsenPerOutlet(
      [lady('a', 'Royal'), lady('b', 'Royal'), lady('c', 'SA')],
      [
        { ladies_id: 'a', status: 'KERJA' },
        { ladies_id: 'b', status: 'MENS' },
        { ladies_id: 'c', status: 'SAKIT' },
      ]
    );

    expect(hasil).toEqual([
      { outlet: 'Royal', rekap: { KERJA: 1, MENS: 1, OFF: 0, SAKIT: 0 }, belum: [] },
      { outlet: 'SA', rekap: { KERJA: 0, MENS: 0, OFF: 0, SAKIT: 1 }, belum: [] },
    ]);
  });

  it('menyebut nama ladies yang belum punya catatan di outletnya', () => {
    const hasil = statusAbsenPerOutlet(
      [lady('a', 'Royal'), lady('b', 'Royal'), lady('c', 'SA')],
      [{ ladies_id: 'a', status: 'OFF' }]
    );

    expect(hasil.map((o) => [o.outlet, o.belum])).toEqual([
      ['Royal', ['Nama b']],
      ['SA', ['Nama c']],
    ]);
  });

  it('mengurutkan outlet sesuai abjad, walau daftar ladies urut nama', () => {
    const hasil = statusAbsenPerOutlet([lady('a', 'Travel'), lady('b', 'Royal'), lady('c', 'SA')], []);

    expect(hasil.map((o) => o.outlet)).toEqual(['Royal', 'SA', 'Travel']);
  });

  it('ladies tanpa outlet tetap terhitung, tidak hilang dari laporan', () => {
    const hasil = statusAbsenPerOutlet([lady('a', null)], []);

    expect(hasil).toEqual([
      { outlet: 'Tanpa Outlet', rekap: { KERJA: 0, MENS: 0, OFF: 0, SAKIT: 0 }, belum: ['Nama a'] },
    ]);
  });

  it('catatan ladies yang sudah tidak aktif tidak ikut terhitung', () => {
    const hasil = statusAbsenPerOutlet(
      [lady('a', 'Royal')],
      [
        { ladies_id: 'a', status: 'KERJA' },
        { ladies_id: 'nonaktif', status: 'KERJA' },
      ]
    );

    expect(hasil[0].rekap.KERJA).toBe(1);
  });

  it('tanpa ladies aktif hasilnya kosong', () => {
    expect(statusAbsenPerOutlet([], [{ ladies_id: 'x', status: 'KERJA' }])).toEqual([]);
  });
});
