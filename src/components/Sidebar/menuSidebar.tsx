import type { ReactNode } from 'react';
import {
  FiHome,
  FiUsers,
  FiShield,
  FiUserCheck,
  FiUser,
  FiBriefcase,
  FiMapPin,
  FiPlusCircle,
  FiBookOpen,
  FiClipboard,
  FiTrendingUp,
  FiActivity,
  FiMessageCircle,
  FiSliders,
  FiGift,
  FiDollarSign,
  FiCreditCard,
  FiCalendar,
} from 'react-icons/fi';

export type ItemMenu = {
  to: string;
  label: string;
  ikon: ReactNode;
  /** Rute lain yang ikut menyalakan menu ini (halaman tambah/detail). Pola
      berakhiran '/' dicocokkan sebagai awalan — lihat utils/cocokRute. */
  cocok?: string[];
  /** Nama lengkap untuk tooltip & pembaca layar saat sidebar diciutkan,
      ketika judul bagian tidak terlihat (mis. dua "Buku Kuning"). */
  namaLengkap?: string;
};

export type BagianMenu = { judul?: string; items: ItemMenu[] };

export type MenuSidebar = {
  bagian: BagianMenu[];
  /** Menempel di dasar sidebar, terpisah dari menu kerja. */
  bawah: ItemMenu[];
};

const PENGATURAN: ItemMenu = { to: '/pengaturan', label: 'Pengaturan', ikon: <FiSliders /> };

/** Ikon & nama sama dengan navbar bawah mobile (BottomNavbarAdmin). Label
    disesuaikan dengan judul halaman yang dibuka. */
export const MENU_ADMIN: MenuSidebar = {
  bagian: [
    { items: [{ to: '/', label: 'Home', ikon: <FiHome /> }] },
    {
      judul: 'Data master',
      items: [
        { to: '/users', label: 'Users', ikon: <FiUsers />, cocok: ['/user-create', '/user-detail/'] },
        { to: '/user-approval', label: 'Persetujuan User', ikon: <FiShield /> },
        { to: '/pengawas', label: 'Pengawas', ikon: <FiUserCheck />, cocok: ['/pengawas-create', '/pengawas-detail/'] },
        { to: '/ladies', label: 'Ladies', ikon: <FiUser />, cocok: ['/ladies-create', '/ladies-detail/'] },
        { to: '/agent', label: 'Agent', ikon: <FiBriefcase />, cocok: ['/agent-create', '/agent-detail/'] },
        { to: '/outlet', label: 'Outlet', ikon: <FiMapPin /> },
      ],
    },
    {
      judul: 'Transaksi ladies',
      items: [
        { to: '/add-transaksi', label: 'Catat Transaksi', ikon: <FiPlusCircle />, namaLengkap: 'Transaksi Ladies' },
        { to: '/buku-kuning', label: 'Buku Kuning', ikon: <FiBookOpen />, namaLengkap: 'Buku Kuning Ladies' },
      ],
    },
    {
      judul: 'Transaksi pengawas',
      items: [
        { to: '/add-transaksi-pengawas', label: 'Catat Transaksi', ikon: <FiPlusCircle />, namaLengkap: 'Transaksi Pengawas' },
        { to: '/buku-kuning-pengawas', label: 'Buku Kuning', ikon: <FiBookOpen />, namaLengkap: 'Buku Kuning Pengawas' },
      ],
    },
    {
      judul: 'Laporan',
      items: [
        { to: '/absensi', label: 'Absensi', ikon: <FiClipboard /> },
        { to: '/rekap-voucher', label: 'Rekap Voucher', ikon: <FiTrendingUp /> },
        { to: '/performa-ladies', label: 'Performa Ladies', ikon: <FiActivity /> },
        { to: '/smart-chat', label: 'Smart Chat', ikon: <FiMessageCircle /> },
      ],
    },
  ],
  bawah: [PENGATURAN],
};

/** Sama dengan navbar bawah + sheet Transaksi/Menu di mobile (BottomNavbarLadies). */
export const MENU_LADIES: MenuSidebar = {
  bagian: [
    { items: [{ to: '/ladies/home', label: 'Home', ikon: <FiHome /> }] },
    {
      judul: 'Transaksi',
      items: [
        { to: '/ladies/voucher', label: 'Voucher', ikon: <FiGift /> },
        { to: '/ladies/pemasukan_lain', label: 'Pemasukan Lain', ikon: <FiDollarSign /> },
        { to: '/ladies/kasbon', label: 'Kasbon', ikon: <FiCreditCard /> },
        { to: '/ladies/dokter', label: 'Dokter', ikon: <FiActivity /> },
      ],
    },
    { items: [{ to: '/ladies/absensi', label: 'Absensi', ikon: <FiCalendar /> }] },
    {
      judul: 'Akun',
      items: [
        { to: '/ladies/profile', label: 'Profil', ikon: <FiUser /> },
        { to: '/smart-chat-ladies', label: 'Smart Chat', ikon: <FiMessageCircle /> },
        { to: '/ladies/peraturan', label: 'Peraturan', ikon: <FiBookOpen /> },
      ],
    },
  ],
  bawah: [PENGATURAN],
};
