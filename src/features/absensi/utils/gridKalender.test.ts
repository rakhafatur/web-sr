import { describe, expect, it } from 'vitest';
import { buatGridBulan } from './gridKalender';

describe('buatGridBulan', () => {
  it('menaruh sel kosong di depan sesuai hari tanggal 1 (minggu mulai Senin)', () => {
    // 1 Oktober 2026 jatuh hari Kamis → 3 sel kosong (Sen, Sel, Rab).
    const grid = buatGridBulan(2026, 9);
    expect(grid.slice(0, 4)).toEqual([null, null, null, '2026-10-01']);
  });

  it('mengisi sel kosong di belakang sampai minggu terakhir genap 7 hari', () => {
    // 3 kosong + 31 hari = 34 → digenapkan jadi 35.
    const grid = buatGridBulan(2026, 9);
    expect(grid).toHaveLength(35);
    expect(grid[33]).toBe('2026-10-31');
    expect(grid[34]).toBeNull();
  });

  it('tidak menambah sel kosong kalau bulan pas dimulai Senin dan habis Minggu', () => {
    // 1 Februari 2027 hari Senin, 28 hari → tepat 4 minggu.
    const grid = buatGridBulan(2027, 1);
    expect(grid).toHaveLength(28);
    expect(grid[0]).toBe('2027-02-01');
    expect(grid[27]).toBe('2027-02-28');
  });

  it('memperhitungkan tahun kabisat', () => {
    const grid = buatGridBulan(2028, 1);
    expect(grid.filter(Boolean)).toHaveLength(29);
    expect(grid).toContain('2028-02-29');
  });

  it('menganggap tanggal 1 hari Minggu sebagai kolom terakhir', () => {
    // 1 November 2026 hari Minggu → 6 sel kosong.
    const grid = buatGridBulan(2026, 10);
    expect(grid.indexOf('2026-11-01')).toBe(6);
  });
});
