/**
 * Menyaring tata letak menu dengan saklar aktif/nonaktif dari Pengaturan
 * (tabel `pengaturan_menu`). Fungsi murni — sumber saklarnya ada di
 * hooks/useMenu.ts.
 *
 * Aturan: menu tanpa catatan = aktif; `selaluAktif` mengabaikan saklar;
 * bagian sidebar / tab sheet yang semua isinya nonaktif ikut disembunyikan.
 */
import { halamanAktif, type BagianMenu, type Halaman, type TabNavbar, type TataSidebar } from './menu';

export type Peran = 'admin' | 'ladies';

/** Kunci baris di tabel pengaturan_menu, mis. 'admin.absensi'. */
export const kunciMenu = (peran: Peran, id: string) => `${peran}.${id}`;

type Saklar = ReadonlySet<string>;

const pemeriksa =
  <Id extends string>(halaman: Record<Id, Halaman>, peran: Peran, nonaktif: Saklar) =>
  (id: Id) =>
    !!halaman[id].selaluAktif || !nonaktif.has(kunciMenu(peran, id));

const saringBagian = <Id extends string>(bagian: BagianMenu<Id>[], tampil: (id: Id) => boolean) =>
  bagian.map((b) => ({ ...b, items: b.items.filter(tampil) })).filter((b) => b.items.length > 0);

export const saringSidebar = <Id extends string>(
  halaman: Record<Id, Halaman>,
  tata: TataSidebar<Id>,
  peran: Peran,
  nonaktif: Saklar
): TataSidebar<Id> => {
  const tampil = pemeriksa(halaman, peran, nonaktif);
  return { bagian: saringBagian(tata.bagian, tampil), bawah: tata.bawah.filter(tampil) };
};

export const saringNavbar = <Id extends string>(
  halaman: Record<Id, Halaman>,
  tabs: TabNavbar<Id>[],
  peran: Peran,
  nonaktif: Saklar
): TabNavbar<Id>[] => {
  const tampil = pemeriksa(halaman, peran, nonaktif);
  return tabs.flatMap((t): TabNavbar<Id>[] => {
    if (t.jenis === 'link') return tampil(t.halaman) ? [t] : [];
    const bagian = saringBagian(t.bagian, tampil);
    return bagian.length > 0 ? [{ ...t, bagian }] : [];
  });
};

/** Halaman nonaktif yang sedang dibuka lewat URL (termasuk turunannya), atau
    null kalau rute ini boleh tampil. */
export const halamanNonaktifDi = <Id extends string>(
  halaman: Record<Id, Halaman>,
  peran: Peran,
  nonaktif: Saklar,
  pathname: string
): Halaman | null => {
  const tampil = pemeriksa(halaman, peran, nonaktif);
  const ketemu = (Object.keys(halaman) as Id[]).find((id) => !tampil(id) && halamanAktif(halaman[id], pathname));
  return ketemu ? halaman[ketemu] : null;
};
