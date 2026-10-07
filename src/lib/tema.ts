/**
 * Tema tampilan (gelap / terang) — pilihan disimpan per perangkat.
 *
 * Bawaan pengguna baru: ikuti sistem HP/OS. Pilihan diganti di halaman
 * Pengaturan. Atribut `data-theme` di <html> dipasang dua kali:
 *  1. skrip kecil di index.html, SEBELUM React & CSS jalan — supaya tidak
 *     berkedip gelap saat dibuka dalam tema terang (logikanya harus sama
 *     dengan `tentukanTema` di bawah);
 *  2. `mulaiTema()` di main.tsx, yang juga mengikuti perubahan tema sistem
 *     selama pilihan = 'sistem'.
 *
 * Bukan Redux: Redux hanya untuk sesi user (lihat CLAUDE.md), dan ini
 * preferensi perangkat, bukan data server.
 */

export type PilihanTema = 'sistem' | 'terang' | 'gelap';
export type TemaAktif = 'terang' | 'gelap';

export const KUNCI_TEMA = 'sr-tema';
const PILIHAN_SAH: PilihanTema[] = ['sistem', 'terang', 'gelap'];

/** Warna status bar HP (meta theme-color) — sama dengan --color-bg tiap tema. */
export const WARNA_LATAR: Record<TemaAktif, string> = {
  gelap: '#0e0e10',
  terang: '#f4f5f7',
};

/** Nilai tersimpan yang rusak/asing dianggap 'sistem', bukan dibiarkan. */
export function normalkanPilihan(nilai: string | null | undefined): PilihanTema {
  return PILIHAN_SAH.includes(nilai as PilihanTema) ? (nilai as PilihanTema) : 'sistem';
}

/** Tema yang benar-benar dipakai dari pilihan user + preferensi sistem. */
export function tentukanTema(pilihan: PilihanTema, sistemGelap: boolean): TemaAktif {
  if (pilihan === 'sistem') return sistemGelap ? 'gelap' : 'terang';
  return pilihan;
}

// ===== Penyimpanan (localStorage bisa tidak tersedia: mode privat, dsb.) =====

function bacaTersimpan(): PilihanTema {
  try {
    return normalkanPilihan(window.localStorage.getItem(KUNCI_TEMA));
  } catch {
    return 'sistem';
  }
}

function tulisTersimpan(pilihan: PilihanTema) {
  try {
    window.localStorage.setItem(KUNCI_TEMA, pilihan);
  } catch {
    // Tidak bisa disimpan — tema tetap berlaku untuk sesi ini saja.
  }
}

/** Sistem dianggap gelap KECUALI jelas meminta terang — sama dengan skrip di
    index.html, supaya perangkat tanpa preferensi tidak berkedip berganti tema. */
const mediaTerang = () =>
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: light)')
    : null;

/** Pasang tema ke dokumen: atribut, color-scheme, dan warna status bar. */
export function terapkanTema(tema: TemaAktif) {
  const root = document.documentElement;
  if (tema === 'terang') root.setAttribute('data-theme', 'light');
  else root.removeAttribute('data-theme');

  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((m) => m.setAttribute('content', WARNA_LATAR[tema]));
}

// ===== Store kecil untuk useSyncExternalStore =====

let pilihanSaatIni: PilihanTema = 'sistem';
const pendengar = new Set<() => void>();
const kabari = () => pendengar.forEach((fn) => fn());

const temaSaatIni = (): TemaAktif =>
  tentukanTema(pilihanSaatIni, !(mediaTerang()?.matches ?? false));

export const storeTema = {
  subscribe(fn: () => void) {
    pendengar.add(fn);
    return () => pendengar.delete(fn);
  },
  getPilihan: () => pilihanSaatIni,
  getTema: temaSaatIni,
  setPilihan(pilihan: PilihanTema) {
    pilihanSaatIni = pilihan;
    tulisTersimpan(pilihan);
    terapkanTema(temaSaatIni());
    kabari();
  },
};

/** Dipanggil sekali di main.tsx: baca pilihan & ikuti perubahan tema sistem. */
export function mulaiTema() {
  pilihanSaatIni = bacaTersimpan();
  terapkanTema(temaSaatIni());

  mediaTerang()?.addEventListener('change', () => {
    if (pilihanSaatIni !== 'sistem') return;
    terapkanTema(temaSaatIni());
    kabari();
  });
}
