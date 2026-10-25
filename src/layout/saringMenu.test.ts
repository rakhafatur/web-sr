import { describe, it, expect } from 'vitest';
import type { Halaman, TabNavbar, TataSidebar } from './menu';
import { halamanNonaktifDi, kunciMenu, saringNavbar, saringSidebar } from './saringMenu';

const h = (rute: string, extra: Partial<Halaman> = {}): Halaman => ({
  rute,
  label: rute,
  ikon: null,
  desc: 'x',
  barSendiri: true,
  ...extra,
});

const HALAMAN = {
  home: h('/', { selaluAktif: true }),
  users: h('/users', { turunan: ['/user-detail/'] }),
  outlet: h('/outlet'),
  absensi: h('/absensi'),
  pengaturan: h('/pengaturan', { selaluAktif: true }),
};
type Id = keyof typeof HALAMAN;

const SIDEBAR: TataSidebar<Id> = {
  bagian: [
    { items: ['home'] },
    { judul: 'Data master', items: ['users', 'outlet'] },
    { judul: 'Laporan', items: ['absensi'] },
  ],
  bawah: ['pengaturan'],
};

const Ikon = () => null;
const NAVBAR: TabNavbar<Id>[] = [
  { jenis: 'link', label: 'Home', ikon: Ikon, halaman: 'home' },
  { jenis: 'link', label: 'Absensi', ikon: Ikon, halaman: 'absensi' },
  {
    jenis: 'sheet',
    label: 'Menu',
    ikon: Ikon,
    judul: 'Menu',
    bagian: [
      { judul: 'Data', items: ['users', 'outlet'] },
      { judul: 'Aplikasi', items: ['pengaturan'] },
    ],
  },
];

const mati = (...ids: Id[]) => new Set(ids.map((id) => kunciMenu('admin', id)));

describe('kunciMenu', () => {
  it('memisahkan menu admin dan ladies yang id-nya sama', () => {
    expect(kunciMenu('admin', 'absensi')).toBe('admin.absensi');
    expect(kunciMenu('ladies', 'absensi')).toBe('ladies.absensi');
  });
});

describe('saringSidebar', () => {
  it('tanpa menu nonaktif, isinya sama persis', () => {
    expect(saringSidebar(HALAMAN, SIDEBAR, 'admin', new Set())).toEqual(SIDEBAR);
  });

  it('membuang menu nonaktif, dan bagian yang jadi kosong ikut hilang', () => {
    const hasil = saringSidebar(HALAMAN, SIDEBAR, 'admin', mati('outlet', 'absensi'));
    expect(hasil.bagian).toEqual([
      { items: ['home'] },
      { judul: 'Data master', items: ['users'] },
    ]);
  });

  it('menu selaluAktif tetap tampil walau tercatat nonaktif', () => {
    const hasil = saringSidebar(HALAMAN, SIDEBAR, 'admin', mati('home', 'pengaturan'));
    expect(hasil).toEqual(SIDEBAR);
  });

  it('saklar peran lain tidak berpengaruh', () => {
    const ladiesMati = new Set([kunciMenu('ladies', 'outlet')]);
    expect(saringSidebar(HALAMAN, SIDEBAR, 'admin', ladiesMati)).toEqual(SIDEBAR);
  });
});

describe('saringNavbar', () => {
  it('tab tautan ke halaman nonaktif hilang', () => {
    const hasil = saringNavbar(HALAMAN, NAVBAR, 'admin', mati('absensi'));
    expect(hasil.map((t) => t.label)).toEqual(['Home', 'Menu']);
  });

  it('item sheet nonaktif hilang, bagian kosong ikut hilang', () => {
    const hasil = saringNavbar(HALAMAN, NAVBAR, 'admin', mati('users', 'outlet'));
    const menu = hasil.find((t) => t.label === 'Menu');
    expect(menu?.jenis === 'sheet' && menu.bagian).toEqual([{ judul: 'Aplikasi', items: ['pengaturan'] }]);
  });

  it('tab sheet yang semua isinya nonaktif ikut hilang', () => {
    const tabs: TabNavbar<Id>[] = [
      NAVBAR[0],
      { jenis: 'sheet', label: 'Laporan', ikon: Ikon, judul: 'Laporan', bagian: [{ items: ['absensi'] }] },
    ];
    expect(saringNavbar(HALAMAN, tabs, 'admin', mati('absensi')).map((t) => t.label)).toEqual(['Home']);
  });
});

describe('halamanNonaktifDi', () => {
  it('mengembalikan halaman nonaktif yang cocok dengan rute, termasuk turunannya', () => {
    const nonaktif = mati('users');
    expect(halamanNonaktifDi(HALAMAN, 'admin', nonaktif, '/users')?.rute).toBe('/users');
    expect(halamanNonaktifDi(HALAMAN, 'admin', nonaktif, '/user-detail/12')?.rute).toBe('/users');
  });

  it('null untuk halaman aktif, halaman selaluAktif, dan rute di luar menu', () => {
    const nonaktif = mati('users', 'home');
    expect(halamanNonaktifDi(HALAMAN, 'admin', nonaktif, '/outlet')).toBeNull();
    expect(halamanNonaktifDi(HALAMAN, 'admin', nonaktif, '/')).toBeNull();
    expect(halamanNonaktifDi(HALAMAN, 'admin', nonaktif, '/login')).toBeNull();
  });
});
