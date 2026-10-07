import { describe, it, expect } from 'vitest';
import { normalkanPilihan, tentukanTema } from './tema';

describe('tentukanTema', () => {
  it('ikuti sistem: gelap kalau sistem gelap, terang kalau sistem terang', () => {
    expect(tentukanTema('sistem', true)).toBe('gelap');
    expect(tentukanTema('sistem', false)).toBe('terang');
  });

  it('pilihan eksplisit mengalahkan tema sistem', () => {
    expect(tentukanTema('terang', true)).toBe('terang');
    expect(tentukanTema('gelap', false)).toBe('gelap');
  });
});

describe('normalkanPilihan', () => {
  it('menerima tiga pilihan yang sah', () => {
    expect(normalkanPilihan('sistem')).toBe('sistem');
    expect(normalkanPilihan('terang')).toBe('terang');
    expect(normalkanPilihan('gelap')).toBe('gelap');
  });

  it('pengguna baru (belum ada nilai) mengikuti sistem', () => {
    expect(normalkanPilihan(null)).toBe('sistem');
    expect(normalkanPilihan(undefined)).toBe('sistem');
  });

  it('nilai rusak/asing dianggap ikuti sistem, bukan dipakai mentah', () => {
    expect(normalkanPilihan('dark')).toBe('sistem');
    expect(normalkanPilihan('')).toBe('sistem');
    expect(normalkanPilihan('TERANG')).toBe('sistem');
  });
});
