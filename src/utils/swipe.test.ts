import { describe, expect, it } from 'vitest';
import { harusTerbuka } from './swipe';

const LEBAR = 72;

describe('harusTerbuka (swipe-to-delete)', () => {
  it('ketukan dengan getaran jari kecil tetap tertutup walau kecepatannya tinggi', () => {
    // Geser 3px dalam ~5ms terbaca ±600px/s — dulu cukup untuk membuka baris.
    expect(harusTerbuka(-3, -900, LEBAR)).toBe(false);
  });

  it('usapan cepat yang cukup jauh membuka baris', () => {
    expect(harusTerbuka(-24, -800, LEBAR)).toBe(true);
  });

  it('usapan pelan melewati setengah lebar tombol membuka baris', () => {
    expect(harusTerbuka(-40, -50, LEBAR)).toBe(true);
  });

  it('usapan pelan yang pendek tetap tertutup', () => {
    expect(harusTerbuka(-20, -100, LEBAR)).toBe(false);
  });

  it('usapan ke kanan tidak pernah membuka', () => {
    expect(harusTerbuka(30, 900, LEBAR)).toBe(false);
  });
});
