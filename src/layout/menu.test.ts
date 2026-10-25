import { describe, it, expect } from 'vitest';
import {
  HALAMAN_ADMIN,
  HALAMAN_LADIES,
  NAVBAR_ADMIN,
  NAVBAR_LADIES,
  RUTE_ADMIN_TANPA_HEADER,
  RUTE_LADIES_TANPA_HEADER,
  SIDEBAR_ADMIN,
  SIDEBAR_LADIES,
  type Halaman,
  type TabNavbar,
  type TataSidebar,
} from './menu';

const idDiSidebar = (s: TataSidebar<string>) => [...s.bagian.flatMap((b) => b.items), ...s.bawah];

const idDiNavbar = (tabs: TabNavbar<string>[]) =>
  tabs.flatMap((t) => (t.jenis === 'link' ? [t.halaman] : t.bagian.flatMap((b) => b.items)));

const itemSheet = (tabs: TabNavbar<string>[]) =>
  tabs.flatMap((t) => (t.jenis === 'sheet' ? t.bagian.flatMap((b) => b.items) : []));

const kasus: [string, Record<string, Halaman>, TataSidebar<string>, TabNavbar<string>[]][] = [
  ['admin', HALAMAN_ADMIN, SIDEBAR_ADMIN, NAVBAR_ADMIN],
  ['ladies', HALAMAN_LADIES, SIDEBAR_LADIES, NAVBAR_LADIES],
];

describe.each(kasus)('menu %s', (_, halaman, sidebar, navbar) => {
  const semuaId = Object.keys(halaman).sort();

  it('setiap halaman muncul di sidebar desktop', () => {
    expect([...new Set(idDiSidebar(sidebar))].sort()).toEqual(semuaId);
  });

  it('setiap halaman muncul di navbar mobile', () => {
    expect([...new Set(idDiNavbar(navbar))].sort()).toEqual(semuaId);
  });

  it('tidak ada halaman yang tercantum dua kali di satu tata letak', () => {
    const s = idDiSidebar(sidebar);
    const n = idDiNavbar(navbar);
    expect(s.length).toBe(new Set(s).size);
    expect(n.length).toBe(new Set(n).size);
  });

  it('setiap item di bottom sheet punya penjelasan singkat', () => {
    const tanpaDesc = itemSheet(navbar).filter((id) => !halaman[id].desc);
    expect(tanpaDesc).toEqual([]);
  });

  it('rute tidak ada yang kembar', () => {
    const rute = Object.values(halaman).map((h) => h.rute);
    expect(rute.length).toBe(new Set(rute).size);
  });
});

// Patokan dari daftar yang dulu ditulis tangan di MainLayout — turunan dari
// HALAMAN_* harus menghasilkan himpunan yang sama.
describe('rute tanpa Header app', () => {
  it('admin sama dengan daftar lama (+ Absen Harian)', () => {
    expect([...RUTE_ADMIN_TANPA_HEADER].sort()).toEqual(
      [
        '/',
        '/add-transaksi',
        '/add-transaksi-pengawas',
        '/buku-kuning',
        '/buku-kuning-pengawas',
        '/outlet',
        '/users',
        '/user-create',
        '/user-approval',
        '/user-detail/',
        '/pengawas',
        '/pengawas-create',
        '/pengawas-detail/',
        '/agent',
        '/agent-create',
        '/agent-detail/',
        '/ladies',
        '/ladies-create',
        '/ladies-detail/',
        '/absensi',
        '/absensi-harian',
        '/rekap-voucher',
        '/performa-ladies',
        '/pengaturan',
      ].sort()
    );
  });

  it('ladies sama dengan daftar lama', () => {
    expect([...RUTE_LADIES_TANPA_HEADER].sort()).toEqual(
      [
        '/ladies/home',
        '/ladies/voucher',
        '/ladies/kasbon',
        '/ladies/dokter',
        '/ladies/pemasukan_lain',
        '/ladies/absensi',
        '/ladies/profile',
        '/ladies/peraturan',
        '/pengaturan',
      ].sort()
    );
  });

  it('halaman chat tidak masuk (diatur sendiri sebagai layar penuh)', () => {
    expect(RUTE_ADMIN_TANPA_HEADER).not.toContain('/smart-chat');
    expect(RUTE_LADIES_TANPA_HEADER).not.toContain('/smart-chat-ladies');
  });
});
