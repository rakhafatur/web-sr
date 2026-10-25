import type { ReactNode } from 'react';
import {
  HALAMAN_ADMIN,
  HALAMAN_LADIES,
  SIDEBAR_ADMIN,
  SIDEBAR_LADIES,
  type Halaman,
  type TataSidebar,
} from '../../layout/menu';

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

/** Isi sidebar dibentuk dari daftar menu bersama (layout/menu.tsx) — jangan
    menulis rute di sini. */
const keMenuSidebar = <Id extends string>(halaman: Record<Id, Halaman>, tata: TataSidebar<Id>): MenuSidebar => {
  const keItem = (id: Id): ItemMenu => {
    const h = halaman[id];
    return { to: h.rute, label: h.label, ikon: h.ikon, cocok: h.turunan, namaLengkap: h.namaLengkap };
  };

  return {
    bagian: tata.bagian.map((b) => ({ judul: b.judul, items: b.items.map(keItem) })),
    bawah: tata.bawah.map(keItem),
  };
};

export const MENU_ADMIN = keMenuSidebar(HALAMAN_ADMIN, SIDEBAR_ADMIN);
export const MENU_LADIES = keMenuSidebar(HALAMAN_LADIES, SIDEBAR_LADIES);
