import { describe, expect, it } from 'vitest';
import { NAV_ADMIN, NAV_LADIES, cariRuteAktif } from './navItems';

describe('cariRuteAktif', () => {
  it('mencocokkan rute persis', () => {
    expect(cariRuteAktif('/ladies', NAV_ADMIN)).toBe('/ladies');
    expect(cariRuteAktif('/absensi', NAV_ADMIN)).toBe('/absensi');
  });

  it('halaman tambah & detail menyalakan item induknya', () => {
    expect(cariRuteAktif('/ladies-create', NAV_ADMIN)).toBe('/ladies');
    expect(cariRuteAktif('/ladies-detail/abc-123', NAV_ADMIN)).toBe('/ladies');
    expect(cariRuteAktif('/pengawas-create', NAV_ADMIN)).toBe('/pengawas');
    expect(cariRuteAktif('/user-detail/9', NAV_ADMIN)).toBe('/users');
  });

  it('tidak mencocokkan hanya karena berawalan sama', () => {
    // Ini bug nyata di BottomNavbarAdmin sebelum diberi penjaga: '/smart-chat'
    // ikut menyala di halaman '/smart-chat-ladies'.
    expect(cariRuteAktif('/smart-chat-ladies', NAV_ADMIN)).not.toBe('/smart-chat');
  });

  it('beranda hanya menyala di rute persis', () => {
    expect(cariRuteAktif('/', NAV_ADMIN)).toBe('/');
    expect(cariRuteAktif('/ladies', NAV_ADMIN)).not.toBe('/');
  });

  it('mengembalikan null kalau tidak ada yang cocok', () => {
    expect(cariRuteAktif('/entah-apa', NAV_ADMIN)).toBeNull();
  });

  it('nav ladies memisahkan beranda ladies dari daftar ladies admin', () => {
    expect(cariRuteAktif('/ladies/home', NAV_LADIES)).toBe('/ladies/home');
    expect(cariRuteAktif('/ladies/voucher', NAV_LADIES)).toBe('/ladies/voucher');
  });
});

describe('kelengkapan menu', () => {
  const semuaPath = (grup: typeof NAV_ADMIN) =>
    grup.flatMap((g) => g.items.map((i) => i.path));

  it('seluruh rute admin terjangkau dari sidebar', () => {
    const wajib = [
      '/',
      '/ladies',
      '/pengawas',
      '/absensi',
      '/add-transaksi',
      '/add-transaksi-pengawas',
      '/buku-kuning',
      '/buku-kuning-pengawas',
      '/rekap-voucher',
      '/performa-ladies',
      '/users',
      '/user-approval',
      '/agent',
      '/outlet',
      '/smart-chat',
    ];
    const ada = semuaPath(NAV_ADMIN);
    const hilang = wajib.filter((p) => !ada.includes(p));
    expect(hilang, `rute tidak ada di sidebar: ${hilang.join(', ')}`).toEqual([]);
  });

  it('seluruh rute ladies terjangkau dari sidebar', () => {
    const wajib = [
      '/ladies/home',
      '/ladies/absensi',
      '/ladies/voucher',
      '/ladies/kasbon',
      '/ladies/dokter',
      '/ladies/pemasukan_lain',
      '/ladies/peraturan',
      '/ladies/profile',
      '/smart-chat-ladies',
    ];
    const ada = semuaPath(NAV_LADIES);
    const hilang = wajib.filter((p) => !ada.includes(p));
    expect(hilang, `rute tidak ada di sidebar: ${hilang.join(', ')}`).toEqual([]);
  });

  it('tidak ada path kembar', () => {
    for (const nav of [NAV_ADMIN, NAV_LADIES]) {
      const path = semuaPath(nav);
      expect(new Set(path).size).toBe(path.length);
    }
  });
});
