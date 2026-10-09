import { describe, expect, it } from 'vitest';
import { cocokRute } from './cocokRute';

describe('cocokRute', () => {
  it('pola tanpa garis miring akhir harus sama persis', () => {
    expect(cocokRute(['/ladies'], '/ladies')).toBe(true);
    expect(cocokRute(['/ladies'], '/ladies-create')).toBe(false);
    expect(cocokRute(['/buku-kuning'], '/buku-kuning-pengawas')).toBe(false);
  });

  it('pola berakhiran / dicocokkan sebagai awalan', () => {
    expect(cocokRute(['/user-detail/'], '/user-detail/123')).toBe(true);
    expect(cocokRute(['/user-detail/'], '/user-detail')).toBe(false);
  });

  it("'/' hanya cocok dengan beranda, bukan semua rute", () => {
    expect(cocokRute(['/'], '/')).toBe(true);
    expect(cocokRute(['/'], '/users')).toBe(false);
  });

  it('cukup satu pola yang cocok', () => {
    expect(cocokRute(['/users', '/user-create', '/user-detail/'], '/user-create')).toBe(true);
    expect(cocokRute([], '/users')).toBe(false);
  });
});
