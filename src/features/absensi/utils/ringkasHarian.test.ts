import { describe, it, expect } from 'vitest';
import { ringkasAbsenHarian } from './ringkasHarian';

describe('ringkasAbsenHarian', () => {
  it('semua ladies terhitung belum diabsen kalau tanggal itu kosong', () => {
    const r = ringkasAbsenHarian(['a', 'b', 'c'], []);

    expect(r.total).toBe(3);
    expect(r.sudah).toBe(0);
    expect(r.belum).toEqual(['a', 'b', 'c']);
    expect(r.rekap).toEqual({ KERJA: 0, MENS: 0, OFF: 0, SAKIT: 0 });
  });

  it('memisahkan yang sudah dan belum, urutan belum mengikuti daftar ladies', () => {
    const r = ringkasAbsenHarian(
      ['a', 'b', 'c', 'd'],
      [
        { ladies_id: 'c', status: 'MENS' },
        { ladies_id: 'a', status: 'KERJA' },
      ]
    );

    expect(r.sudah).toBe(2);
    expect(r.belum).toEqual(['b', 'd']);
    expect(r.rekap).toEqual({ KERJA: 1, MENS: 1, OFF: 0, SAKIT: 0 });
  });

  it('mengabaikan catatan ladies yang tidak ada di daftar (mis. sudah nonaktif)', () => {
    const r = ringkasAbsenHarian(
      ['a'],
      [
        { ladies_id: 'a', status: 'OFF' },
        { ladies_id: 'x', status: 'KERJA' },
      ]
    );

    expect(r.total).toBe(1);
    expect(r.sudah).toBe(1);
    expect(r.rekap).toEqual({ KERJA: 0, MENS: 0, OFF: 1, SAKIT: 0 });
  });

  it('status tak dikenal tetap dihitung sudah diabsen, tapi tidak masuk rekap', () => {
    const r = ringkasAbsenHarian(['a', 'b'], [{ ladies_id: 'a', status: 'CUTI' }]);

    expect(r.sudah).toBe(1);
    expect(r.belum).toEqual(['b']);
    expect(r.rekap).toEqual({ KERJA: 0, MENS: 0, OFF: 0, SAKIT: 0 });
  });
});
