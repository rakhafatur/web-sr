/**
 * Satu-satunya sumber kebenaran untuk keputusan tema.
 *
 * Fungsi di sini sengaja murni dan tidak menyentuh `window`/`document`
 * langsung: pemanggilnya yang menyuntikkan akses penyimpanan dan elemen
 * target. Dengan begitu logikanya bisa diuji tanpa perlu menambah jsdom,
 * dan script pra-paint di index.html bisa meniru aturan yang sama persis.
 */

/** Kunci localStorage. Script pra-paint di index.html HARUS memakai nilai
    yang sama — ada test yang menjaga keduanya tidak berpisah jalan. */
export const THEME_STORAGE_KEY = 'sr-theme';

/** Yang bisa dipilih pengguna. */
export type ThemePreference = 'light' | 'dark' | 'system';

/** Yang benar-benar ditulis ke <html data-theme>. Tidak pernah 'system' —
    itu yang membuat CSS cukup satu selektor tanpa menduplikasi nilai token. */
export type ResolvedTheme = 'light' | 'dark';

/** Cukup `setAttribute` — sengaja bukan HTMLElement supaya bisa diuji dengan objek tiruan. */
export type ThemeTarget = { setAttribute(name: string, value: string): void };

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

/** Tema bawaan produk.

    Sengaja 'dark', bukan 'system': gelap adalah identitas aplikasi ini —
    dataset UI/UX Pro Max memilih latar gelap untuk seluruh tiga palet teratas
    kategori "admin dashboard finance", dan aplikasi ini memang sudah gelap
    sejak sebelum redesign. Tema terang tetap tersedia lewat pengalih. */
const BAWAAN: ThemePreference = 'dark';

export function readPreference(getItem: (key: string) => string | null): ThemePreference {
  const tersimpan = getItem(THEME_STORAGE_KEY);
  return isThemePreference(tersimpan) ? tersimpan : BAWAAN;
}

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme {
  if (preference === 'system') return systemPrefersDark ? 'dark' : 'light';
  return preference;
}

export function applyTheme(root: ThemeTarget, theme: ResolvedTheme): void {
  root.setAttribute('data-theme', theme);
}
