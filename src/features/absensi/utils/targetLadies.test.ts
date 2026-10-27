import { describe, it, expect } from 'vitest';
import { rekapTargetLadies, sisaHariTerbuka, statusTarget } from './targetLadies';

describe('sisaHariTerbuka', () => {
  it('bulan berjalan: hari ini s/d akhir bulan, termasuk hari ini', () => {
    // Oktober 2026 punya 31 hari: 27..31 = 5 hari.
    expect(sisaHariTerbuka('2026-10', '2026-10-27', new Set())).toBe(5);
  });

  it('tanggal yang sudah tercatat (apa pun statusnya) tidak dihitung lagi', () => {
    expect(sisaHariTerbuka('2026-10', '2026-10-27', new Set(['2026-10-27', '2026-10-30']))).toBe(3);
  });

  it('catatan sebelum hari ini tidak mengurangi sisa', () => {
    expect(sisaHariTerbuka('2026-10', '2026-10-27', new Set(['2026-10-01']))).toBe(5);
  });

  it('bulan yang sudah lewat: tidak ada sisa', () => {
    expect(sisaHariTerbuka('2026-09', '2026-10-27', new Set())).toBe(0);
  });

  it('bulan yang belum mulai: sebulan penuh', () => {
    expect(sisaHariTerbuka('2026-11', '2026-10-27', new Set())).toBe(30);
  });

  it('hari terakhir bulan: tinggal hari ini', () => {
    expect(sisaHariTerbuka('2026-10', '2026-10-31', new Set())).toBe(1);
  });
});

describe('statusTarget', () => {
  it('tercapai kalau hari kerja >= target', () => {
    expect(statusTarget(15, 0, 15)).toEqual({ kurang: 0, status: 'tercapai' });
    expect(statusTarget(20, 3, 15)).toEqual({ kurang: 0, status: 'tercapai' });
  });

  it('mengejar kalau kekurangan masih muat di sisa hari', () => {
    expect(statusTarget(10, 5, 15)).toEqual({ kurang: 5, status: 'mengejar' });
    expect(statusTarget(10, 9, 15)).toEqual({ kurang: 5, status: 'mengejar' });
  });

  it('tidak tercapai kalau kekurangan lebih besar dari sisa hari', () => {
    expect(statusTarget(10, 4, 15)).toEqual({ kurang: 5, status: 'tidak-tercapai' });
    expect(statusTarget(3, 0, 15)).toEqual({ kurang: 12, status: 'tidak-tercapai' });
  });
});

describe('rekapTargetLadies', () => {
  const ladies = [
    { id: 'a', nama_ladies: 'Ani', nama_outlet: 'Royal' },
    { id: 'b', nama_ladies: 'Bela', nama_outlet: 'SA' },
    { id: 'c', nama_ladies: 'Cici', nama_outlet: null },
  ];

  const kerja = (ladiesId: string, hari: number[], status = 'KERJA') =>
    hari.map((h) => ({ ladies_id: ladiesId, tanggal: `2026-09-${String(h).padStart(2, '0')}`, status }));

  it('hanya status KERJA yang dihitung (tanpa peduli huruf besar/kecil)', () => {
    const absensi = [...kerja('a', [1, 2, 3]), ...kerja('a', [4], 'kerja'), ...kerja('a', [5, 6], 'OFF')];
    const [ani] = rekapTargetLadies(ladies.slice(0, 1), absensi, '2026-09', '2026-10-27', 15);
    expect(ani.hariKerja).toBe(4);
    expect(ani.kurang).toBe(11);
  });

  it('catatan ganda di tanggal yang sama dihitung sekali', () => {
    const absensi = [...kerja('a', [1, 1, 2])];
    const [ani] = rekapTargetLadies(ladies.slice(0, 1), absensi, '2026-09', '2026-10-27', 15);
    expect(ani.hariKerja).toBe(2);
  });

  it('catatan di luar bulan yang dipilih diabaikan', () => {
    const absensi = [{ ladies_id: 'a', tanggal: '2026-08-31', status: 'KERJA' }, ...kerja('a', [1])];
    const [ani] = rekapTargetLadies(ladies.slice(0, 1), absensi, '2026-09', '2026-10-27', 15);
    expect(ani.hariKerja).toBe(1);
  });

  it('ladies tanpa catatan tetap muncul dengan 0 hari', () => {
    const rows = rekapTargetLadies(ladies, [], '2026-09', '2026-10-27', 15);
    expect(rows).toHaveLength(3);
    expect(rows.every((r) => r.hariKerja === 0 && r.kurang === 15)).toBe(true);
  });

  it('urut dari kekurangan terbesar, lalu nama', () => {
    const absensi = [
      ...kerja('a', Array.from({ length: 15 }, (_, i) => i + 1)), // tercapai
      ...kerja('b', [1, 2]), // kurang 13
      ...kerja('c', [1, 2, 3, 4, 5]), // kurang 10
    ];
    const rows = rekapTargetLadies(ladies, absensi, '2026-09', '2026-10-27', 15);
    expect(rows.map((r) => r.id)).toEqual(['b', 'c', 'a']);
    expect(rows.map((r) => r.status)).toEqual(['tidak-tercapai', 'tidak-tercapai', 'tercapai']);
  });

  it('bulan berjalan: sisa hari dihitung per ladies', () => {
    const absensi = [
      { ladies_id: 'a', tanggal: '2026-10-01', status: 'KERJA' },
      { ladies_id: 'a', tanggal: '2026-10-27', status: 'OFF' },
    ];
    const [ani] = rekapTargetLadies(ladies.slice(0, 1), absensi, '2026-10', '2026-10-27', 15);
    expect(ani.sisaHari).toBe(4); // 28..31
    expect(ani.kurang).toBe(14);
    expect(ani.status).toBe('tidak-tercapai');
  });
});
