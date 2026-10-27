/**
 * Satu-satunya daftar menu aplikasi.
 *
 * `HALAMAN_*` mendaftar tiap halaman sekali: rute, nama, ikon, penjelasan,
 * halaman turunannya, dan apakah di mobile punya bar atas sendiri. Tata letak
 * sidebar desktop dan navbar bawah mobile di bawahnya hanya menyebut id
 * halaman — jadi menambah menu = satu entri di HALAMAN_* + id-nya di kedua
 * tata letak (menu.test.ts menolak kalau salah satu terlewat).
 *
 * Penanda tab aktif (navbar bawah) dan daftar rute tanpa Header app
 * (MainLayout) diturunkan dari sini, bukan ditulis ulang.
 */
import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import {
  FiActivity,
  FiBarChart2,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiCheckSquare,
  FiClipboard,
  FiCreditCard,
  FiDollarSign,
  FiGift,
  FiHome,
  FiMapPin,
  FiMenu,
  FiMessageCircle,
  FiPlusCircle,
  FiShield,
  FiSliders,
  FiTarget,
  FiTrendingUp,
  FiUser,
  FiUserCheck,
  FiUsers,
} from 'react-icons/fi';

import { cocokRute } from '../utils/cocokRute';

export type Halaman = {
  rute: string;
  /** Nama di sidebar desktop (dan di mobile kalau `mobile.label` kosong). */
  label: string;
  ikon: ReactNode;
  /** Penjelasan satu baris di bottom sheet mobile. Wajib untuk item sheet. */
  desc?: string;
  /** Nama lengkap untuk tooltip & pembaca layar saat sidebar diciutkan,
      ketika judul bagian tidak terlihat (mis. dua "Buku Kuning"). */
  namaLengkap?: string;
  /** Nama/ikon di mobile kalau sengaja beda dengan sidebar — di sheet tidak
      ada judul bagian "Transaksi ladies", jadi namanya harus lengkap. */
  mobile?: { label?: string; ikon?: ReactNode };
  /** Halaman tambah/detail yang ikut menyalakan menu ini. Pola cocokRute:
      berakhiran '/' = awalan (rute ber-parameter). */
  turunan?: string[];
  /** Di mobile punya bar atas sendiri (MobilePageBar), jadi Header app
      dicabut di MainLayout. Berlaku juga untuk halaman turunannya. */
  barSendiri: boolean;
  /** Tidak bisa dinonaktifkan dari Pengaturan (Home, dan Pengaturan sendiri
      — kalau ikut mati, admin tidak bisa menyalakannya lagi). */
  selaluAktif?: boolean;
};

export type BagianMenu<Id extends string> = { judul?: string; items: Id[] };

export type TataSidebar<Id extends string> = {
  bagian: BagianMenu<Id>[];
  /** Menempel di dasar sidebar, terpisah dari menu kerja. */
  bawah: Id[];
};

/** Tombol di navbar bawah: langsung ke satu halaman, atau membuka sheet. */
export type TabNavbar<Id extends string> =
  | { jenis: 'link'; label: string; ikon: IconType; halaman: Id }
  | {
      jenis: 'sheet';
      label: string;
      ikon: IconType;
      /** Judul sheet (boleh beda dari label tab, mis. Report → Laporan). */
      judul: string;
      bagian: BagianMenu<Id>[];
      /** Tampilkan tombol Keluar di dasar sheet. */
      keluar?: boolean;
    };

/** Semua pola rute milik satu halaman (dirinya + turunannya). */
export const polaHalaman = (h: Halaman) => [h.rute, ...(h.turunan ?? [])];

export const halamanAktif = (h: Halaman, pathname: string) => cocokRute(polaHalaman(h), pathname);

const PENGATURAN: Halaman = {
  rute: '/pengaturan',
  label: 'Pengaturan',
  ikon: <FiSliders />,
  desc: 'Tema terang / gelap',
  barSendiri: true,
  selaluAktif: true,
};

// =========================================================
// ADMIN
// =========================================================

export const HALAMAN_ADMIN = {
  home: { rute: '/', label: 'Home', ikon: <FiHome />, barSendiri: true, selaluAktif: true },

  users: {
    rute: '/users',
    label: 'Users',
    ikon: <FiUsers />,
    desc: 'Akun pengguna',
    turunan: ['/user-create', '/user-detail/'],
    barSendiri: true,
  },
  userApproval: {
    rute: '/user-approval',
    label: 'Persetujuan User',
    ikon: <FiShield />,
    desc: 'Persetujuan akun baru',
    mobile: { label: 'Approval User' },
    barSendiri: true,
  },
  pengawas: {
    rute: '/pengawas',
    label: 'Pengawas',
    ikon: <FiUserCheck />,
    desc: 'Data pengawas',
    turunan: ['/pengawas-create', '/pengawas-detail/'],
    barSendiri: true,
  },
  ladies: {
    rute: '/ladies',
    label: 'Ladies',
    ikon: <FiUser />,
    desc: 'Data ladies',
    turunan: ['/ladies-create', '/ladies-detail/'],
    barSendiri: true,
  },
  agent: {
    rute: '/agent',
    label: 'Agent',
    ikon: <FiBriefcase />,
    desc: 'Data agent',
    turunan: ['/agent-create', '/agent-detail/'],
    barSendiri: true,
  },
  outlet: { rute: '/outlet', label: 'Outlet', ikon: <FiMapPin />, desc: 'Data outlet', barSendiri: true },

  transaksiLadies: {
    rute: '/add-transaksi',
    label: 'Catat Transaksi',
    namaLengkap: 'Transaksi Ladies',
    ikon: <FiPlusCircle />,
    desc: 'Catat transaksi baru',
    mobile: { label: 'Transaksi Ladies', ikon: <FiDollarSign /> },
    barSendiri: true,
  },
  bukuKuningLadies: {
    rute: '/buku-kuning',
    label: 'Buku Kuning',
    namaLengkap: 'Buku Kuning Ladies',
    ikon: <FiBookOpen />,
    desc: 'Riwayat & saldo berjalan',
    mobile: { label: 'Buku Kuning Ladies' },
    barSendiri: true,
  },
  transaksiPengawas: {
    rute: '/add-transaksi-pengawas',
    label: 'Catat Transaksi',
    namaLengkap: 'Transaksi Pengawas',
    ikon: <FiPlusCircle />,
    desc: 'Catat transaksi baru',
    mobile: { label: 'Transaksi Pengawas', ikon: <FiDollarSign /> },
    barSendiri: true,
  },
  bukuKuningPengawas: {
    rute: '/buku-kuning-pengawas',
    label: 'Buku Kuning',
    namaLengkap: 'Buku Kuning Pengawas',
    ikon: <FiBookOpen />,
    desc: 'Riwayat & saldo berjalan',
    mobile: { label: 'Buku Kuning Pengawas' },
    barSendiri: true,
  },

  absenHarian: {
    rute: '/absensi-harian',
    label: 'Absen Harian',
    ikon: <FiCheckSquare />,
    desc: 'Semua ladies dalam satu tanggal',
    barSendiri: true,
  },
  absensi: {
    rute: '/absensi',
    label: 'Absensi',
    ikon: <FiClipboard />,
    desc: 'Kehadiran per ladies, sebulan',
    barSendiri: true,
  },
  rekapVoucher: {
    rute: '/rekap-voucher',
    label: 'Rekap Voucher',
    ikon: <FiTrendingUp />,
    desc: 'Rekap voucher per periode',
    barSendiri: true,
  },
  performaLadies: {
    rute: '/performa-ladies',
    label: 'Performa Ladies',
    ikon: <FiActivity />,
    desc: 'Perbandingan performa ladies',
    barSendiri: true,
  },
  // Chat mengatur tata letaknya sendiri di MainLayout (layar penuh), bukan
  // lewat daftar tanpa-header.
  smartChat: {
    rute: '/smart-chat',
    label: 'Smart Chat',
    ikon: <FiMessageCircle />,
    desc: 'Tanya statistik & insight',
    mobile: { label: 'Chat SR' },
    barSendiri: false,
  },

  pengaturan: PENGATURAN,
} satisfies Record<string, Halaman>;

export type IdAdmin = keyof typeof HALAMAN_ADMIN;

export const SIDEBAR_ADMIN: TataSidebar<IdAdmin> = {
  bagian: [
    { items: ['home'] },
    { judul: 'Data master', items: ['users', 'userApproval', 'pengawas', 'ladies', 'agent', 'outlet'] },
    { judul: 'Transaksi ladies', items: ['transaksiLadies', 'bukuKuningLadies'] },
    { judul: 'Transaksi pengawas', items: ['transaksiPengawas', 'bukuKuningPengawas'] },
    { judul: 'Laporan', items: ['absenHarian', 'absensi', 'rekapVoucher', 'performaLadies', 'smartChat'] },
  ],
  bawah: ['pengaturan'],
};

export const NAVBAR_ADMIN: TabNavbar<IdAdmin>[] = [
  { jenis: 'link', label: 'Home', ikon: FiHome, halaman: 'home' },
  {
    jenis: 'sheet',
    label: 'Transaksi',
    ikon: FiDollarSign,
    judul: 'Transaksi',
    bagian: [
      { judul: 'Ladies', items: ['transaksiLadies', 'bukuKuningLadies'] },
      { judul: 'Pengawas', items: ['transaksiPengawas', 'bukuKuningPengawas'] },
    ],
  },
  {
    jenis: 'sheet',
    label: 'Report',
    ikon: FiBarChart2,
    judul: 'Laporan',
    bagian: [{ items: ['absenHarian', 'absensi', 'rekapVoucher', 'performaLadies'] }],
  },
  {
    jenis: 'sheet',
    label: 'Menu',
    ikon: FiMenu,
    judul: 'Menu',
    keluar: true,
    bagian: [
      { judul: 'Data master', items: ['users', 'userApproval', 'pengawas', 'ladies', 'agent', 'outlet'] },
      { judul: 'Asisten', items: ['smartChat'] },
      { judul: 'Aplikasi', items: ['pengaturan'] },
    ],
  },
];

// =========================================================
// LADIES
// =========================================================

export const HALAMAN_LADIES = {
  home: { rute: '/ladies/home', label: 'Home', ikon: <FiHome />, barSendiri: true, selaluAktif: true },

  voucher: {
    rute: '/ladies/voucher',
    label: 'Voucher',
    ikon: <FiGift />,
    desc: 'Voucher & estimasi pendapatan',
    barSendiri: true,
  },
  pemasukanLain: {
    rute: '/ladies/pemasukan_lain',
    label: 'Pemasukan Lain',
    ikon: <FiDollarSign />,
    desc: 'Pemasukan tambahan',
    barSendiri: true,
  },
  kasbon: {
    rute: '/ladies/kasbon',
    label: 'Kasbon',
    ikon: <FiCreditCard />,
    desc: 'Pengambilan kasbon',
    barSendiri: true,
  },
  dokter: {
    rute: '/ladies/dokter',
    label: 'Dokter',
    ikon: <FiActivity />,
    desc: 'Biaya kesehatan',
    barSendiri: true,
  },

  absensi: { rute: '/ladies/absensi', label: 'Absensi', ikon: <FiCalendar />, barSendiri: true },

  profil: {
    rute: '/ladies/profile',
    label: 'Profil',
    ikon: <FiUser />,
    desc: 'Data diri & akun',
    barSendiri: true,
  },
  smartChat: {
    rute: '/smart-chat-ladies',
    label: 'Smart Chat',
    ikon: <FiMessageCircle />,
    desc: 'Tanya voucher & absen kamu',
    barSendiri: false,
  },
  peraturan: {
    rute: '/ladies/peraturan',
    label: 'Peraturan',
    ikon: <FiBookOpen />,
    desc: 'Aturan kerja SR',
    barSendiri: true,
  },

  pengaturan: PENGATURAN,
} satisfies Record<string, Halaman>;

export type IdLadies = keyof typeof HALAMAN_LADIES;

export const SIDEBAR_LADIES: TataSidebar<IdLadies> = {
  bagian: [
    { items: ['home'] },
    { judul: 'Transaksi', items: ['voucher', 'pemasukanLain', 'kasbon', 'dokter'] },
    { items: ['absensi'] },
    { judul: 'Akun', items: ['profil', 'smartChat', 'peraturan'] },
  ],
  bawah: ['pengaturan'],
};

export const NAVBAR_LADIES: TabNavbar<IdLadies>[] = [
  { jenis: 'link', label: 'Home', ikon: FiHome, halaman: 'home' },
  {
    jenis: 'sheet',
    label: 'Transaksi',
    ikon: FiDollarSign,
    judul: 'Transaksi',
    // Bukan "Input Transaksi": keempat halaman ini hanya menampilkan
    // riwayat — ladies tidak bisa menginput apa pun di sana.
    bagian: [{ judul: 'Riwayat transaksi', items: ['voucher', 'pemasukanLain', 'kasbon', 'dokter'] }],
  },
  { jenis: 'link', label: 'Absensi', ikon: FiCalendar, halaman: 'absensi' },
  {
    jenis: 'sheet',
    label: 'Menu',
    ikon: FiUser,
    judul: 'Menu',
    keluar: true,
    bagian: [{ judul: 'Akun', items: ['profil', 'smartChat', 'peraturan', 'pengaturan'] }],
  },
];

// =========================================================
// PENGAWAS
// =========================================================

export const HALAMAN_PENGAWAS = {
  home: { rute: '/pengawas/home', label: 'Home', ikon: <FiHome />, barSendiri: true, selaluAktif: true },

  // Pola menu ladies (riwayat per jenis), bukan Buku Kuning — pengawas
  // hanya melihat, pencatatannya tetap di admin.
  gaji: {
    rute: '/pengawas/gaji',
    label: 'Gaji',
    ikon: <FiTrendingUp />,
    desc: 'Gaji bulanan',
    barSendiri: true,
  },
  pemasukanLain: {
    rute: '/pengawas/pemasukan-lain',
    label: 'Pemasukan Lain',
    ikon: <FiDollarSign />,
    desc: 'Bonus & pemasukan tambahan',
    barSendiri: true,
  },
  kasbon: {
    rute: '/pengawas/kasbon',
    label: 'Kasbon',
    ikon: <FiCreditCard />,
    desc: 'Pengeluaran bulan ini',
    barSendiri: true,
  },

  absenLadies: {
    rute: '/pengawas/absen-ladies',
    label: 'Target Absen',
    ikon: <FiTarget />,
    desc: 'Ladies yang kurang target',
    barSendiri: true,
  },

  pengaturan: PENGATURAN,
} satisfies Record<string, Halaman>;

export type IdPengawas = keyof typeof HALAMAN_PENGAWAS;

export const SIDEBAR_PENGAWAS: TataSidebar<IdPengawas> = {
  bagian: [
    { items: ['home'] },
    { judul: 'Transaksi', items: ['gaji', 'pemasukanLain', 'kasbon'] },
    { judul: 'Ladies', items: ['absenLadies'] },
  ],
  bawah: ['pengaturan'],
};

export const NAVBAR_PENGAWAS: TabNavbar<IdPengawas>[] = [
  { jenis: 'link', label: 'Home', ikon: FiHome, halaman: 'home' },
  {
    jenis: 'sheet',
    label: 'Transaksi',
    ikon: FiDollarSign,
    judul: 'Transaksi',
    bagian: [{ judul: 'Riwayat transaksi', items: ['gaji', 'pemasukanLain', 'kasbon'] }],
  },
  { jenis: 'link', label: 'Absen', ikon: FiTarget, halaman: 'absenLadies' },
  {
    jenis: 'sheet',
    label: 'Menu',
    ikon: FiUser,
    judul: 'Menu',
    keluar: true,
    bagian: [{ judul: 'Aplikasi', items: ['pengaturan'] }],
  },
];

// =========================================================
// TURUNAN
// =========================================================

/** Pola rute halaman yang di mobile punya bar atas sendiri (+ turunannya). */
const ruteTanpaHeader = (daftar: Record<string, Halaman>) =>
  Object.values(daftar)
    .filter((h) => h.barSendiri)
    .flatMap(polaHalaman);

export const RUTE_ADMIN_TANPA_HEADER = ruteTanpaHeader(HALAMAN_ADMIN);
export const RUTE_LADIES_TANPA_HEADER = ruteTanpaHeader(HALAMAN_LADIES);
export const RUTE_PENGAWAS_TANPA_HEADER = ruteTanpaHeader(HALAMAN_PENGAWAS);
