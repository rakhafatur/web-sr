import { describe, it, expect } from 'vitest';
import { peranDari } from './peran';

describe('peranDari', () => {
  it('ladies kalau ladies_id terisi', () => {
    expect(peranDari({ ladies_id: 'l1', pengawas_id: null })).toBe('ladies');
  });

  it('pengawas kalau hanya pengawas_id terisi', () => {
    expect(peranDari({ ladies_id: null, pengawas_id: 'p1' })).toBe('pengawas');
  });

  it('ladies didahulukan kalau keduanya terisi (perilaku lama tidak berubah)', () => {
    expect(peranDari({ ladies_id: 'l1', pengawas_id: 'p1' })).toBe('ladies');
  });

  it('admin kalau tidak ada penugasan atau belum login', () => {
    expect(peranDari({ ladies_id: null, pengawas_id: null })).toBe('admin');
    expect(peranDari({})).toBe('admin');
    expect(peranDari(null)).toBe('admin');
  });
});
