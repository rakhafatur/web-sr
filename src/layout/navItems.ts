import {
  FiBarChart2,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiCheckSquare,
  FiCreditCard,
  FiDollarSign,
  FiFileText,
  FiGift,
  FiHeart,
  FiHome,
  FiMapPin,
  FiMessageSquare,
  FiPlusCircle,
  FiUser,
  FiUserCheck,
  FiUsers,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';

export type ItemNav = {
  path: string;
  label: string;
  ikon: IconType;
  /** Rute lain yang ikut menyalakan item ini — halaman Tambah & Detail
      memakai akhiran (`/ladies-create`), bukan sub-path, jadi harus
      disebut satu per satu. */
  cocokJuga?: string[];
};

export type GrupNav = {
  label: string;
  items: ItemNav[];
};

/* Grup berlabel, BUKAN accordion. Semua item selalu terlihat — accordion
   yang sekarang dipakai default tertutup dan tidak pernah disinkronkan ke
   URL, sehingga di halaman dalam sidebar tidak menunjukkan posisi pengguna. */
export const NAV_ADMIN: GrupNav[] = [
  {
    label: 'Beranda',
    items: [{ path: '/', label: 'Home', ikon: FiHome }],
  },
  {
    label: 'Operasional',
    items: [
      {
        path: '/ladies',
        label: 'Ladies',
        ikon: FiUser,
        cocokJuga: ['/ladies-create', '/ladies-detail'],
      },
      {
        path: '/pengawas',
        label: 'Pengawas',
        ikon: FiUserCheck,
        cocokJuga: ['/pengawas-create', '/pengawas-detail'],
      },
      { path: '/absensi', label: 'Absensi', ikon: FiCalendar },
    ],
  },
  {
    label: 'Transaksi',
    items: [
      { path: '/add-transaksi', label: 'Transaksi Ladies', ikon: FiPlusCircle },
      {
        path: '/add-transaksi-pengawas',
        label: 'Transaksi Pengawas',
        ikon: FiPlusCircle,
      },
    ],
  },
  {
    label: 'Keuangan',
    items: [
      { path: '/buku-kuning', label: 'Buku Kuning', ikon: FiBookOpen },
      {
        path: '/buku-kuning-pengawas',
        label: 'Buku Kuning Pengawas',
        ikon: FiBookOpen,
      },
      { path: '/rekap-voucher', label: 'Rekap Voucher', ikon: FiDollarSign },
      { path: '/performa-ladies', label: 'Performa Ladies', ikon: FiBarChart2 },
    ],
  },
  {
    label: 'Master Data',
    items: [
      {
        path: '/users',
        label: 'Users',
        ikon: FiUsers,
        cocokJuga: ['/user-create', '/user-detail'],
      },
      { path: '/user-approval', label: 'Approval User', ikon: FiCheckSquare },
      {
        path: '/agent',
        label: 'Agent',
        ikon: FiBriefcase,
        cocokJuga: ['/agent-create', '/agent-detail'],
      },
      { path: '/outlet', label: 'Outlet', ikon: FiMapPin },
    ],
  },
  {
    label: 'Lain',
    items: [{ path: '/smart-chat', label: 'Smart Chat', ikon: FiMessageSquare }],
  },
];

export const NAV_LADIES: GrupNav[] = [
  {
    label: 'Beranda',
    items: [
      { path: '/ladies/home', label: 'Home', ikon: FiHome },
      { path: '/ladies/absensi', label: 'Absensi', ikon: FiCalendar },
    ],
  },
  {
    label: 'Catatan',
    items: [
      { path: '/ladies/voucher', label: 'Voucher', ikon: FiGift },
      { path: '/ladies/kasbon', label: 'Kasbon', ikon: FiCreditCard },
      { path: '/ladies/dokter', label: 'Dokter', ikon: FiHeart },
      {
        path: '/ladies/pemasukan_lain',
        label: 'Pemasukan Lain',
        ikon: FiDollarSign,
      },
    ],
  },
  {
    label: 'Lain',
    items: [
      { path: '/ladies/peraturan', label: 'Peraturan', ikon: FiFileText },
      { path: '/smart-chat-ladies', label: 'Smart Chat', ikon: FiMessageSquare },
      { path: '/ladies/profile', label: 'Profil', ikon: FiUser },
    ],
  },
];

/** Cocok kalau sama persis atau merupakan induk langsung — bukan sekadar
    berawalan sama. Tanpa syarat itu `/smart-chat` ikut menyala di
    `/smart-chat-ladies`.

    Perhatikan rute `'/'`: syarat awalannya jadi `'//'` yang tidak pernah
    benar, jadi beranda hanya menyala di rute persis. Jangan sederhanakan
    jadi `startsWith(rute)` — itu membuat beranda menyala di setiap halaman. */
function cocok(pathname: string, rute: string): boolean {
  return pathname === rute || pathname.startsWith(`${rute}/`);
}

/**
 * Path item nav yang harus disorot untuk URL tertentu, atau null.
 *
 * Kecocokan terpanjang menang: tanpa itu `/ladies` akan menelan
 * `/ladies/voucher` di nav ladies.
 */
export function cariRuteAktif(pathname: string, grup: GrupNav[]): string | null {
  let terbaik: string | null = null;
  let panjangTerbaik = -1;

  for (const g of grup) {
    for (const item of g.items) {
      const kandidat = [item.path, ...(item.cocokJuga ?? [])];
      for (const rute of kandidat) {
        if (!cocok(pathname, rute)) continue;
        if (rute.length > panjangTerbaik) {
          panjangTerbaik = rute.length;
          terbaik = item.path;
        }
      }
    }
  }

  return terbaik;
}
