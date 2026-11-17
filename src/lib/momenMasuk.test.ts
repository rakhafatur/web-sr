import { describe, expect, it } from 'vitest';
import { layarTerbuka } from './momenMasuk';

describe('layarTerbuka', () => {
  it('tertutup selama splash masih tampil', () => {
    expect(layarTerbuka({ splash: true, tirai: 'diam' })).toBe(false);
  });

  it('terbuka setelah splash selesai dan tidak ada tirai', () => {
    expect(layarTerbuka({ splash: false, tirai: 'diam' })).toBe(true);
  });

  it('tertutup saat tirai sedang menutup atau menahan', () => {
    expect(layarTerbuka({ splash: false, tirai: 'menutup' })).toBe(false);
    expect(layarTerbuka({ splash: false, tirai: 'tertutup' })).toBe(false);
  });

  it('sudah terbuka begitu tirai mulai terangkat, supaya isi muncul bersamaan', () => {
    expect(layarTerbuka({ splash: false, tirai: 'membuka' })).toBe(true);
  });
});
