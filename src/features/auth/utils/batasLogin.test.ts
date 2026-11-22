import { describe, expect, it } from 'vitest';
import {
  CATATAN_KOSONG,
  LAMA_KUNCI_MS,
  catatGagal,
  formatSisaKunci,
  statusLogin,
} from './batasLogin';

const T = 1_000_000;

describe('batas login', () => {
  it('awal: belum gagal, jatah 3', () => {
    expect(statusLogin(CATATAN_KOSONG, T)).toEqual({ terkunci: false, sisaPercobaan: 3, pernahGagal: false });
  });

  it('gagal 1 → sisa 2, gagal 2 → sisa 1', () => {
    const c1 = catatGagal(CATATAN_KOSONG, T);
    expect(statusLogin(c1, T)).toEqual({ terkunci: false, sisaPercobaan: 2, pernahGagal: true });
    const c2 = catatGagal(c1, T + 1);
    expect(statusLogin(c2, T + 1)).toEqual({ terkunci: false, sisaPercobaan: 1, pernahGagal: true });
  });

  it('gagal ke-3 → terkunci 5 menit', () => {
    let c = CATATAN_KOSONG;
    for (let i = 0; i < 3; i++) c = catatGagal(c, T);
    expect(statusLogin(c, T)).toEqual({ terkunci: true, sisaMs: LAMA_KUNCI_MS });
    expect(statusLogin(c, T + LAMA_KUNCI_MS - 1)).toMatchObject({ terkunci: true, sisaMs: 1 });
  });

  it('gagal saat terkunci tidak memperpanjang kunci', () => {
    let c = CATATAN_KOSONG;
    for (let i = 0; i < 3; i++) c = catatGagal(c, T);
    expect(catatGagal(c, T + 1000)).toBe(c);
  });

  it('setelah kunci lewat → jatah penuh lagi, lalu bisa gagal dari awal', () => {
    let c = CATATAN_KOSONG;
    for (let i = 0; i < 3; i++) c = catatGagal(c, T);
    const lewat = T + LAMA_KUNCI_MS;
    expect(statusLogin(c, lewat)).toEqual({ terkunci: false, sisaPercobaan: 3, pernahGagal: false });
    expect(statusLogin(catatGagal(c, lewat), lewat)).toMatchObject({ sisaPercobaan: 2 });
  });
});

describe('formatSisaKunci', () => {
  it('menit:detik, dibulatkan ke atas', () => {
    expect(formatSisaKunci(LAMA_KUNCI_MS)).toBe('5:00');
    expect(formatSisaKunci(245_500)).toBe('4:06');
    expect(formatSisaKunci(1)).toBe('0:01');
    expect(formatSisaKunci(-5)).toBe('0:00');
  });
});
