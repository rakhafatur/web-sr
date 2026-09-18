# Fase 0 — Fondasi: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memasang seluruh fondasi redesign (Tailwind v4, lapisan token dua tema, pemilihan tema, Inter Variable) **tanpa mengubah satu piksel pun** tampilan aplikasi.

**Architecture:** Tailwind v4 dipasang berdampingan dengan Bootstrap yang masih aktif, **dengan Preflight dimatikan** supaya reset CSS-nya tidak bertabrakan dengan Bootstrap. Token tema baru didefinisikan di berkas terpisah dan belum dikonsumsi komponen mana pun. Tema diselesaikan jadi nilai konkret (`light`/`dark`) oleh script pra-paint di `index.html`, lalu dijaga sinkron saat runtime oleh `ThemeProvider`. Karena belum ada CSS yang membaca token baru, atribut `data-theme` yang muncul di `<html>` tidak berefek visual apa pun — itulah yang membuat fase ini bisa diverifikasi sebagai no-op.

**Tech Stack:** React 19, Vite 6, TypeScript 5.8, Vitest 4, Tailwind CSS v4 (`@tailwindcss/vite`), `@fontsource-variable/inter`, Bootstrap 5 (masih aktif).

**Spec:** `docs/superpowers/specs/2026-09-18-ui-redesign-design.md`

## Global Constraints

- **Nol perubahan visual.** Fase ini gagal kalau ada satu tampilan pun yang bergeser. Itu gate-nya, bukan efek samping.
- **Nol perubahan business logic.** Tidak ada berkas di `src/features/*/utils/`, `src/hooks/`, atau `src/lib/supabaseClient.ts` yang boleh disentuh.
- **Nol perubahan autentikasi.** `AuthContext`, `SessionGuard`, `ProtectedRoute`, `RootRoute`, `LoginPage`, `SignUpPage` tidak disentuh.
- **Bootstrap tetap aktif dan tetap diimpor.** Pencabutan dikunci di Fase 7.
- **Preflight Tailwind wajib mati** sepanjang fase ini. Preflight adalah reset CSS Tailwind; mengaktifkannya akan menimpa gaya dasar Bootstrap (tombol, heading, list, border) dan langsung melanggar gate nol-perubahan.
- **Inter di-bundle tapi belum dipakai.** `--font-base` di `variable.css` tidak diubah. Penerapan font ke `body` terjadi di Fase 2.
- **Manifest PWA tidak diubah di fase ini.** `background_color`/`theme_color` tetap `#0e0e10` sampai tampilan terang benar-benar hadir.
- **Baseline yang harus tetap hijau:**
  - `npx tsc -b` → exit 0
  - `npm test` → 73 test di 6 berkas, semua lolos
  - `npm run lint` → **0 error, 3 warning** — perhatikan: baseline lint memang
    belum bersih. Ketiga warning itu `react-refresh/only-export-components` di
    `ConfirmDialog.tsx`, `StatusBadge.tsx`, dan `AuthContext.tsx`, semuanya
    karena berkas mengekspor komponen **dan** fungsi/konstanta. Jangan
    "memperbaiki" ketiganya di fase ini — itu di luar ruang lingkup dan akan
    mengaburkan sinyal. Yang penting: **jumlah error tetap 0.**
- **Test co-located** mengikuti pola proyek: `nama.test.ts` bersebelahan dengan sumbernya, bukan di folder `tests/` terpisah.
- **Komentar dan pesan commit dalam Bahasa Indonesia**, mengikuti konvensi repo.

---

### Task 1: Lapisan logika tema yang murni & teruji

Semua keputusan tema (baca preferensi, selesaikan jadi tema konkret, tulis atribut) dikumpulkan di satu berkas murni supaya bisa diuji tanpa DOM dan tanpa menambah dependensi `jsdom`.

**Files:**
- Create: `src/lib/theme.ts`
- Test: `src/lib/theme.test.ts`

**Interfaces:**
- Consumes: tidak ada (task pertama)
- Produces:
  - `THEME_STORAGE_KEY: string` (nilainya `'sr-theme'`)
  - `type ThemePreference = 'light' | 'dark' | 'system'`
  - `type ResolvedTheme = 'light' | 'dark'`
  - `isThemePreference(value: unknown): value is ThemePreference`
  - `readPreference(getItem: (key: string) => string | null): ThemePreference`
  - `resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): ResolvedTheme`
  - `applyTheme(root: ThemeTarget, theme: ResolvedTheme): void` dengan `type ThemeTarget = { setAttribute(name: string, value: string): void }`

- [ ] **Step 1: Tulis test yang gagal**

Buat `src/lib/theme.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import {
  THEME_STORAGE_KEY,
  applyTheme,
  isThemePreference,
  readPreference,
  resolveTheme,
} from './theme';

describe('isThemePreference', () => {
  it('menerima tiga nilai yang sah', () => {
    expect(isThemePreference('light')).toBe(true);
    expect(isThemePreference('dark')).toBe(true);
    expect(isThemePreference('system')).toBe(true);
  });

  it('menolak nilai lain', () => {
    expect(isThemePreference('midnight')).toBe(false);
    expect(isThemePreference('')).toBe(false);
    expect(isThemePreference(null)).toBe(false);
    expect(isThemePreference(undefined)).toBe(false);
    expect(isThemePreference(1)).toBe(false);
  });
});

describe('readPreference', () => {
  it('mengembalikan preferensi tersimpan kalau sah', () => {
    expect(readPreference(() => 'dark')).toBe('dark');
    expect(readPreference(() => 'light')).toBe('light');
    expect(readPreference(() => 'system')).toBe('system');
  });

  it('jatuh ke "system" kalau belum pernah disimpan', () => {
    expect(readPreference(() => null)).toBe('system');
  });

  it('jatuh ke "system" kalau isinya rusak', () => {
    expect(readPreference(() => 'bukan-tema')).toBe('system');
  });

  it('membaca dari kunci penyimpanan yang benar', () => {
    const getItem = vi.fn(() => 'dark');
    readPreference(getItem);
    expect(getItem).toHaveBeenCalledWith(THEME_STORAGE_KEY);
  });
});

describe('resolveTheme', () => {
  it('preferensi eksplisit mengalahkan preferensi sistem', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('"system" mengikuti preferensi sistem', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('selalu mengembalikan nilai konkret, tidak pernah "system"', () => {
    const hasil = [
      resolveTheme('system', true),
      resolveTheme('system', false),
      resolveTheme('light', true),
      resolveTheme('dark', false),
    ];
    expect(hasil).not.toContain('system');
  });
});

describe('applyTheme', () => {
  it('menulis data-theme dengan nilai konkret', () => {
    const root = { setAttribute: vi.fn() };
    applyTheme(root, 'dark');
    expect(root.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx vitest run src/lib/theme.test.ts`
Expected: FAIL — `Failed to resolve import "./theme"`.

- [ ] **Step 3: Tulis implementasi minimal**

Buat `src/lib/theme.ts`:

```ts
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

export function readPreference(getItem: (key: string) => string | null): ThemePreference {
  const tersimpan = getItem(THEME_STORAGE_KEY);
  return isThemePreference(tersimpan) ? tersimpan : 'system';
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
```

- [ ] **Step 4: Jalankan test, pastikan lolos**

Run: `npx vitest run src/lib/theme.test.ts`
Expected: PASS — 10 test lolos.

- [ ] **Step 5: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 3 warning · 83 test lolos (73 lama + 10 baru).

- [ ] **Step 6: Commit**

```bash
git add src/lib/theme.ts src/lib/theme.test.ts
git commit -m "feat(tema): lapisan logika pemilihan tema yang murni & teruji

Belum disambungkan ke mana pun — hanya fondasi untuk script pra-paint
dan ThemeProvider di task berikutnya.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Script pra-paint di index.html

Tema harus sudah tertulis di `<html>` **sebelum paint pertama**, kalau tidak akan ada kedip terang/gelap setiap kali aplikasi dibuka. Script ini tidak bisa mengimpor `theme.ts` (modul dimuat setelah paint), jadi ia meniru aturannya — dan sebuah test menjaga kunci penyimpanannya tidak berpisah jalan.

**Files:**
- Modify: `index.html` (sisipkan setelah blok `<style>` anti-blink yang sudah ada)
- Test: `src/lib/theme.test.ts` (tambah blok `describe` baru)

**Interfaces:**
- Consumes: `THEME_STORAGE_KEY` dari Task 1
- Produces: atribut `data-theme="light"|"dark"` pada `<html>` sejak paint pertama

- [ ] **Step 1: Tulis test yang gagal**

Dua hal di `src/lib/theme.test.ts`. Pertama, tambahkan dua impor ini **di bagian atas berkas**, bersama impor yang sudah ada (bukan di bawah — impor di tengah berkas menyulitkan pembacaan meski ESM tetap menghoistingnya):

```ts
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
```

Kedua, tambahkan blok ini di akhir berkas:

```ts
describe('script pra-paint di index.html', () => {
  const indexHtml = readFileSync(
    fileURLToPath(new URL('../../index.html', import.meta.url)),
    'utf-8',
  );

  it('memakai kunci penyimpanan yang sama dengan theme.ts', () => {
    expect(indexHtml).toContain(`'${THEME_STORAGE_KEY}'`);
  });

  it('menulis data-theme sebelum modul aplikasi dimuat', () => {
    const posisiScriptTema = indexHtml.indexOf('data-theme');
    const posisiModulAplikasi = indexHtml.indexOf('src="/src/main.tsx"');

    expect(posisiScriptTema).toBeGreaterThan(-1);
    expect(posisiModulAplikasi).toBeGreaterThan(-1);
    expect(posisiScriptTema).toBeLessThan(posisiModulAplikasi);
  });

  it('menangani localStorage yang melempar (mode privat)', () => {
    expect(indexHtml).toMatch(/catch/);
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx vitest run src/lib/theme.test.ts`
Expected: FAIL — `expected '<!doctype html>…' to contain "'sr-theme'"`.

- [ ] **Step 3: Sisipkan script ke index.html**

Di `index.html`, tepat **setelah** blok `<style>` anti-blink yang sudah ada dan **sebelum** `<meta name="theme-color">`, sisipkan:

```html
    <!-- Menentukan tema SEBELUM paint pertama supaya tidak ada kedip
         terang/gelap saat aplikasi dibuka. Aturannya harus sama persis
         dengan src/lib/theme.ts — kunci 'sr-theme' dijaga oleh test di
         src/lib/theme.test.ts. Sengaja ditulis inline & tanpa modul:
         apa pun yang di-import baru jalan setelah paint. -->
    <script>
      (function () {
        var html = document.documentElement;
        try {
          var pref = localStorage.getItem('sr-theme');
          if (pref !== 'light' && pref !== 'dark') pref = 'system';
          var gelap =
            pref === 'dark' ||
            (pref === 'system' &&
              window.matchMedia('(prefers-color-scheme: dark)').matches);
          html.setAttribute('data-theme', gelap ? 'dark' : 'light');
        } catch (e) {
          // localStorage melempar di mode privat / cookie diblokir.
          html.setAttribute('data-theme', 'light');
        }
      })();
    </script>
```

- [ ] **Step 4: Jalankan test, pastikan lolos**

Run: `npx vitest run src/lib/theme.test.ts`
Expected: PASS — 13 test lolos.

- [ ] **Step 5: Verifikasi nol perubahan visual**

Run: `npm run dev`

Buka aplikasi, lalu di DevTools console:

```js
document.documentElement.getAttribute('data-theme')
```

Expected: `"light"` atau `"dark"` sesuai setelan OS. **Tampilan harus tetap gelap persis seperti sebelumnya** di kedua kasus — belum ada CSS yang membaca atribut ini. Kalau ada yang berubah, hentikan dan cari penyebabnya.

- [ ] **Step 6: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 3 warning · 86 test lolos.

- [ ] **Step 7: Commit**

```bash
git add index.html src/lib/theme.test.ts
git commit -m "feat(tema): tulis data-theme sebelum paint pertama

Belum ada CSS yang membaca atribut ini, jadi tampilan tidak berubah.
Test menjaga kunci penyimpanan di index.html tetap sama dengan theme.ts.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Tailwind v4 berdampingan dengan Bootstrap, tanpa Preflight

**Files:**
- Modify: `package.json` (dependensi)
- Modify: `vite.config.ts:1-7`
- Create: `src/styles/theme.css`
- Modify: `src/main.tsx:4-8`

**Interfaces:**
- Consumes: tidak ada
- Produces: berkas `src/styles/theme.css` sebagai satu-satunya tempat token baru; utility Tailwind tersedia tapi belum dipakai

- [ ] **Step 1: Pasang Tailwind**

```bash
npm install -D tailwindcss@^4 @tailwindcss/vite@^4
```

- [ ] **Step 2: Daftarkan plugin di vite.config.ts**

Ubah bagian atas `vite.config.ts` menjadi:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
```

Sisa berkas tidak diubah.

- [ ] **Step 3: Buat berkas theme.css tanpa Preflight**

Buat `src/styles/theme.css`:

```css
/* =========================================================================
   Tailwind v4 — SENGAJA TANPA PREFLIGHT.

   `@import "tailwindcss"` yang biasa ikut membawa Preflight, yaitu reset CSS
   bawaan Tailwind. Selama Bootstrap masih aktif (sampai Fase 7), reset itu
   akan menimpa gaya dasar Bootstrap — tombol, heading, list, border — dan
   langsung mengubah tampilan di seluruh aplikasi. Karena itu lapisan diimpor
   satu per satu dan `preflight.css` ditinggalkan.

   JANGAN ganti tiga baris di bawah jadi `@import "tailwindcss";` sebelum
   Bootstrap benar-benar dicabut.
   ========================================================================= */

@layer theme, base, components, utilities;

@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/utilities.css' layer(utilities);
```

- [ ] **Step 4: Impor theme.css paling akhir di main.tsx**

Di `src/main.tsx`, ubah blok impor CSS menjadi:

```ts
import 'bootstrap/dist/css/bootstrap.min.css';

import './styles/variable.css';
import './styles/global.css';
import './styles/reset.css';
// Paling akhir supaya utility Tailwind menang atas kelas Bootstrap pada
// spesifisitas yang sama. Urutan ini penting mulai Fase 1 ketika utility
// benar-benar dipakai di komponen.
import './styles/theme.css';
```

- [ ] **Step 5: Verifikasi Preflight benar-benar tidak ikut terbawa**

```bash
npm run build && grep -c "abbr:where" dist/assets/*.css
```

Expected: `0` pada setiap berkas CSS (atau `grep` keluar dengan status 1 tanpa hasil). `abbr:where(...)` adalah penanda khas Preflight Tailwind v4 — kalau muncul, Preflight ikut terbawa dan gate nol-perubahan sudah pecah.

Verifikasi kedua:

```bash
grep -c "box-sizing:border-box" dist/assets/*.css
```

Expected: hitungannya **sama dengan sebelum perubahan** (Bootstrap sendiri punya aturan ini). Bandingkan dengan `git stash` bila ragu.

- [ ] **Step 6: Verifikasi nol perubahan visual**

Run: `npm run dev`

Buka minimal enam halaman ini dan bandingkan dengan ingatan/screenshot sebelum perubahan — semuanya harus identik:
`/` · `/ladies` · `/add-transaksi` · `/buku-kuning` · `/absensi` · `/rekap-voucher`

- [ ] **Step 7: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 3 warning · 86 test lolos.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vite.config.ts src/styles/theme.css src/main.tsx
git commit -m "build: pasang Tailwind v4 berdampingan dengan Bootstrap

Preflight sengaja dimatikan dengan mengimpor lapisan satu per satu —
reset bawaan Tailwind akan menimpa gaya dasar Bootstrap yang masih aktif
sampai Fase 7. Belum ada utility yang dipakai, jadi tampilan tidak berubah.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Token dua tema

Token ditulis dengan prefiks `--color-*` karena itulah yang membuat Tailwind v4 menghasilkan utility `bg-*`, `text-*`, dan `border-*`. Nama di sini **menggantikan** penamaan di §3.1 spec (`--bg-canvas`, `--text-primary`, dst) yang ditulis sebelum kendala namespace ini diketahui.

**Files:**
- Modify: `src/styles/theme.css`
- Test: `src/styles/tokens.test.ts`

**Interfaces:**
- Consumes: berkas `src/styles/theme.css` dari Task 3
- Produces: token semantik yang dipakai seluruh fase berikutnya —
  `--color-canvas`, `--color-surface`, `--color-subtle`, `--color-hover`,
  `--color-fg`, `--color-fg-muted`, `--color-fg-faint`, `--color-fg-on-brand`,
  `--color-line`, `--color-line-subtle`, `--color-line-strong`,
  `--color-brand`, `--color-brand-hover`, `--color-brand-subtle`, `--color-brand-fg`,
  `--color-money-in`, `--color-money-out`,
  `--color-success-bg`, `--color-success-line`, `--color-success-fg`,
  `--color-warning-bg`, `--color-warning-line`, `--color-warning-fg`,
  `--color-danger-bg`, `--color-danger-line`, `--color-danger-fg`, `--color-danger-solid`

- [ ] **Step 1: Tulis test yang gagal**

Test ini mencegah satu kelas bug yang mahal: token yang lupa diberi nilai gelap akan membuat teks tidak terbaca di tema gelap, dan itu baru ketahuan jauh belakangan.

Buat `src/styles/tokens.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const css = readFileSync(
  fileURLToPath(new URL('./theme.css', import.meta.url)),
  'utf-8',
);

/** Ambil isi satu blok `{ ... }` yang diawali penanda tertentu. */
function ambilBlok(penanda: string): string {
  const mulai = css.indexOf(penanda);
  if (mulai === -1) throw new Error(`Blok "${penanda}" tidak ditemukan di theme.css`);
  const buka = css.indexOf('{', mulai);
  const tutup = css.indexOf('\n}', buka);
  return css.slice(buka, tutup);
}

function namaToken(blok: string): string[] {
  return [...blok.matchAll(/--color-[a-z0-9-]+/g)].map((m) => m[0]);
}

/** Token yang sengaja sama di kedua tema karena selalu di atas warna brand. */
const SENGAJA_SAMA = ['--color-fg-on-brand'];

describe('token tema', () => {
  const terang = namaToken(ambilBlok('@theme'));
  const gelap = namaToken(ambilBlok("[data-theme='dark']"));

  it('tema terang mendefinisikan token warna', () => {
    expect(terang.length).toBeGreaterThan(20);
  });

  it('setiap token terang punya nilai gelap', () => {
    const kurang = terang.filter(
      (t) => !gelap.includes(t) && !SENGAJA_SAMA.includes(t),
    );
    expect(kurang, `token tanpa nilai gelap: ${kurang.join(', ')}`).toEqual([]);
  });

  it('tema gelap tidak memperkenalkan token yang tidak ada di terang', () => {
    const asing = gelap.filter((t) => !terang.includes(t));
    expect(asing, `token hanya ada di gelap: ${asing.join(', ')}`).toEqual([]);
  });

  it('tema gelap mengumumkan color-scheme supaya kontrol native ikut gelap', () => {
    expect(ambilBlok("[data-theme='dark']")).toContain('color-scheme: dark');
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx vitest run src/styles/tokens.test.ts`
Expected: FAIL — `Blok "@theme" tidak ditemukan di theme.css`.

- [ ] **Step 3: Tambahkan token ke theme.css**

Tambahkan di bawah tiga baris `@import` yang sudah ada di `src/styles/theme.css`:

```css
/* =========================================================================
   TOKEN SEMANTIK — satu-satunya warna yang boleh disebut komponen.

   Komponen TIDAK PERNAH menulis hex dan tidak pernah menyebut nama primitif.
   Cukup token di bawah; ganti tema = ganti isi token, komponen tidak berubah.
   Itu yang membuat dua tema hanya menambah sedikit kerja, bukan dua kali lipat.

   Prefiks `--color-*` wajib: dari situlah Tailwind v4 menghasilkan utility
   `bg-canvas`, `text-fg-muted`, `border-line`, dan seterusnya.
   ========================================================================= */

@theme {
  /* Permukaan */
  --color-canvas: #ffffff;
  --color-surface: #fcfcfd;
  --color-subtle: #f9fafb;
  --color-hover: #f2f4f7;

  /* Teks */
  --color-fg: #101828;
  --color-fg-muted: #475467;
  --color-fg-faint: #98a2b3;
  --color-fg-on-brand: #ffffff;

  /* Garis */
  --color-line: #eaecf0;
  --color-line-subtle: #f2f4f7;
  --color-line-strong: #d0d5dd;

  /* Brand — hanya untuk aksi utama & item navigasi aktif. Bukan untuk
     kartu, header halaman, atau badge. */
  --color-brand: #4f46e5;
  --color-brand-hover: #4338ca;
  --color-brand-subtle: #eef0ff;
  --color-brand-fg: #3730a3;

  /* Uang */
  --color-money-in: #067647;
  --color-money-out: #b42318;

  /* Status */
  --color-success-bg: #ecfdf3;
  --color-success-line: #abefc6;
  --color-success-fg: #067647;
  --color-warning-bg: #fffaeb;
  --color-warning-line: #fedf89;
  --color-warning-fg: #b54708;
  --color-danger-bg: #fef3f2;
  --color-danger-line: #fecdca;
  --color-danger-fg: #b42318;
  --color-danger-solid: #d92d20;
}

/* Cukup satu selektor tanpa menduplikasi apa pun ke dalam @media: script
   pra-paint di index.html selalu menuliskan nilai konkret ("light"/"dark")
   ke <html>, termasuk ketika pilihan pengguna adalah "ikut sistem". */
:root[data-theme='dark'] {
  color-scheme: dark;

  --color-canvas: #09090b;
  --color-surface: #101012;
  --color-subtle: #18181b;
  --color-hover: #1f1f23;

  --color-fg: #fafafa;
  --color-fg-muted: #a1a1aa;
  --color-fg-faint: #52525b;

  --color-line: #1f1f23;
  --color-line-subtle: #131316;
  --color-line-strong: #27272a;

  --color-brand: #6d5cf0;
  --color-brand-hover: #7c6ff5;
  --color-brand-subtle: #1a1730;
  --color-brand-fg: #a79bff;

  --color-money-in: #4ade80;
  --color-money-out: #f87171;

  --color-success-bg: #0c1f16;
  --color-success-line: #1b4430;
  --color-success-fg: #4ade80;
  --color-warning-bg: #221a0b;
  --color-warning-line: #453416;
  --color-warning-fg: #fbbf4d;
  --color-danger-bg: #20110f;
  --color-danger-line: #4a1f1c;
  --color-danger-fg: #f87171;
  --color-danger-solid: #e5484d;
}
```

- [ ] **Step 4: Jalankan test, pastikan lolos**

Run: `npx vitest run src/styles/tokens.test.ts`
Expected: PASS — 4 test lolos.

- [ ] **Step 5: Verifikasi nol perubahan visual**

Run: `npm run dev`

Di DevTools console, jalankan:

```js
getComputedStyle(document.documentElement).getPropertyValue('--color-canvas')
```

Expected: `#ffffff` (tema terang) atau `#09090b` (gelap) — **dan tampilan aplikasi tetap gelap persis seperti sebelumnya**, karena belum ada satu pun aturan CSS yang memakai token ini. Kalau tampilan berubah, berarti ada yang salah mengonsumsi token lebih awal.

- [ ] **Step 6: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 3 warning · 90 test lolos.

- [ ] **Step 7: Commit**

```bash
git add src/styles/theme.css src/styles/tokens.test.ts
git commit -m "feat(tema): token semantik untuk tema terang & gelap

Belum dikonsumsi komponen mana pun, jadi tampilan belum berubah.
Test menjaga setiap token terang punya pasangan gelapnya — token yang
terlewat akan bikin teks tak terbaca dan baru ketahuan jauh belakangan.

Nama token memakai prefiks --color-* (bukan --bg-*/--text-* seperti di
spec) karena dari situlah Tailwind v4 menghasilkan utility-nya.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Inter Variable di-bundle, belum diterapkan

**Files:**
- Modify: `package.json`
- Modify: `src/main.tsx` (satu baris impor)
- Modify: `src/styles/theme.css` (satu token font)

**Interfaces:**
- Consumes: `src/styles/theme.css` dari Task 4
- Produces: token `--font-sans` berisi `'Inter Variable'` + fallback sistem, siap dipakai Fase 2

- [ ] **Step 1: Pasang paket font**

```bash
npm install @fontsource-variable/inter
```

Paket ini menaruh berkas font di bundel aplikasi, bukan mengambilnya dari CDN Google. Itu syarat mutlak: aplikasi ini PWA dan harus tetap tampil benar saat offline.

- [ ] **Step 2: Impor di main.tsx**

Di `src/main.tsx`, tambahkan tepat di atas `import 'bootstrap/dist/css/bootstrap.min.css';`:

```ts
// Font di-bundle lokal (bukan CDN) supaya PWA tetap benar saat offline.
// SENGAJA belum diterapkan ke body — --font-base di variable.css masih
// 'Segoe UI' sampai Fase 2. Fase ini wajib nol perubahan visual.
import '@fontsource-variable/inter';
```

- [ ] **Step 3: Tambahkan token font ke theme.css**

Di dalam blok `@theme` di `src/styles/theme.css`, tambahkan di paling atas sebelum `/* Permukaan */`:

```css
  /* Belum dipakai. Diterapkan ke body di Fase 2 bersamaan dengan shell baru —
     menerapkannya sekarang akan mengubah setiap layar dan melanggar gate
     nol-perubahan fase ini. */
  --font-sans: 'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
```

- [ ] **Step 4: Verifikasi font termuat tapi belum dipakai**

Run: `npm run dev`

Di DevTools:
1. Tab **Network**, filter **Font** → harus ada berkas `.woff2` Inter yang termuat.
2. Di console:

```js
getComputedStyle(document.body).fontFamily
```

Expected: masih `"Segoe UI", sans-serif` — **bukan** Inter. Kalau sudah Inter, ada yang salah menerapkannya lebih awal.

- [ ] **Step 5: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 3 warning · 90 test lolos.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/main.tsx src/styles/theme.css
git commit -m "build: bundel Inter Variable secara lokal, belum diterapkan

Lokal (bukan CDN Google) supaya PWA tetap benar saat offline. Belum
dipasang ke body — penerapannya di Fase 2 bersama shell baru, supaya
fase ini tetap nol perubahan visual.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: ThemeProvider

Script pra-paint hanya jalan sekali. `ThemeProvider` yang menjaga atribut tetap benar saat runtime: ketika pengguna mengganti pilihan, dan ketika preferensi sistem berubah saat aplikasi sedang terbuka.

**Files:**
- Create: `src/context/ThemeContext.tsx`
- Modify: `src/main.tsx` (bungkus pohon komponen)

**Interfaces:**
- Consumes: `THEME_STORAGE_KEY`, `readPreference`, `resolveTheme`, `applyTheme`, `ThemePreference`, `ResolvedTheme` dari Task 1
- Produces:
  - `ThemeProvider({ children }: { children: React.ReactNode })`
  - `useTheme(): { preference: ThemePreference; theme: ResolvedTheme; setPreference: (p: ThemePreference) => void }`

  Fase 2 memakai `useTheme()` untuk membuat pengalih tema di kaki sidebar dan halaman Profil.

- [ ] **Step 1: Buat ThemeContext.tsx**

Berkas ini mengikuti pola `src/context/AuthContext.tsx` yang sudah ada.

```tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  THEME_STORAGE_KEY,
  applyTheme,
  readPreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from '../lib/theme';

type ThemeContextValue = {
  /** Pilihan pengguna, termasuk 'system'. */
  preference: ThemePreference;
  /** Tema yang benar-benar berlaku sekarang. Tidak pernah 'system'. */
  theme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const KUERI_GELAP = '(prefers-color-scheme: dark)';

/** localStorage melempar di mode privat / saat cookie diblokir — di situ
    aplikasi tetap harus jalan, cukup tanpa mengingat pilihan. */
function bacaPenyimpanan(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Menjaga <html data-theme> tetap benar selama aplikasi berjalan.
 *
 * Nilai awalnya sudah ditulis oleh script pra-paint di index.html — provider
 * ini tidak menggantikannya, hanya meneruskannya. Keduanya memakai aturan
 * yang sama dari src/lib/theme.ts.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    readPreference(bacaPenyimpanan),
  );

  const [sistemGelap, setSistemGelap] = useState(
    () => window.matchMedia(KUERI_GELAP).matches,
  );

  // Preferensi OS bisa berubah saat aplikasi sedang terbuka (mis. jadwal
  // gelap otomatis di HP) — tanpa ini, tampilan baru ikut setelah reload.
  useEffect(() => {
    const mq = window.matchMedia(KUERI_GELAP);
    const saatBerubah = (e: MediaQueryListEvent) => setSistemGelap(e.matches);

    mq.addEventListener('change', saatBerubah);
    return () => mq.removeEventListener('change', saatBerubah);
  }, []);

  const theme = resolveTheme(preference, sistemGelap);

  useEffect(() => {
    applyTheme(document.documentElement, theme);
  }, [theme]);

  const setPreference = useCallback((berikutnya: ThemePreference) => {
    setPreferenceState(berikutnya);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, berikutnya);
    } catch {
      // Tidak bisa diingat, tapi pilihan tetap berlaku sampai tab ditutup.
    }
  }, []);

  const value = useMemo(
    () => ({ preference, theme, setPreference }),
    [preference, theme, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme harus dipakai di dalam <ThemeProvider>');
  return ctx;
}
```

- [ ] **Step 2: Bungkus pohon komponen di main.tsx**

Tambahkan impor:

```ts
import { ThemeProvider } from './context/ThemeContext';
```

Lalu bungkus `<ErrorBoundary>` dari luar — tema harus tetap berlaku bahkan ketika aplikasi jatuh ke layar error:

```tsx
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <AuthProvider>
              <App />
            </AuthProvider>
          </Provider>
        </QueryClientProvider>
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>
);
```

- [ ] **Step 3: Verifikasi pergantian tema berfungsi**

Run: `npm run dev`

Di DevTools console:

```js
localStorage.setItem('sr-theme', 'dark'); location.reload();
```

Expected: `<html data-theme="dark">`, tampilan **tetap sama** (belum ada yang mengonsumsi token).

Lalu:

```js
localStorage.setItem('sr-theme', 'light'); location.reload();
```

Expected: `<html data-theme="light">`, tampilan **masih tetap sama**.

Terakhir, kembalikan ke bawaan:

```js
localStorage.removeItem('sr-theme'); location.reload();
```

Expected: atribut mengikuti setelan OS.

- [ ] **Step 4: Verifikasi tidak ada regresi fungsional**

Masih di `npm run dev`, telusuri alur ini dan pastikan semuanya berperilaku sama seperti sebelumnya:

1. Login → masuk ke Home
2. `/ladies` → cari, ganti halaman, buka detail
3. `/add-transaksi` → pilih ladies, form tampil, riwayat tampil
4. `/absensi` → kalender tampil, modal tambah bisa dibuka & ditutup
5. `/buku-kuning` → saldo berjalan tampil, tombol Cetak menghasilkan PDF
6. Logout

- [ ] **Step 5: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint **0 error / 4 warning** · 90 test lolos. Warning keempat muncul di `ThemeContext.tsx` karena berkas itu mengekspor `ThemeProvider` (komponen) sekaligus `useTheme` (hook) — sama persis dengan `AuthContext.tsx` yang sudah ada, jadi konsisten dengan pola proyek dan bukan regresi.

- [ ] **Step 6: Commit**

```bash
git add src/context/ThemeContext.tsx src/main.tsx
git commit -m "feat(tema): ThemeProvider untuk pergantian tema saat runtime

Script pra-paint hanya jalan sekali; provider ini yang menjaga atribut
tetap benar saat pengguna mengganti pilihan dan saat preferensi OS
berubah selagi aplikasi terbuka. Dipasang di luar ErrorBoundary supaya
tema tetap berlaku di layar error.

Belum ada pengalih tema di UI — itu bagian Fase 2.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Catat aturan baru di CLAUDE.md & tutup fase

Tanpa langkah ini, aturan fondasi hanya hidup di kepala orang yang mengerjakan Fase 0, dan fase-fase berikutnya akan melanggarnya tanpa sadar.

**Files:**
- Modify: `CLAUDE.md` (tambah satu bagian baru sebelum bagian "Deploy & rilis")

**Interfaces:**
- Consumes: seluruh hasil Task 1–6
- Produces: aturan tertulis yang mengikat Fase 1–7

- [ ] **Step 1: Tambahkan bagian baru di CLAUDE.md**

Sisipkan sebelum bagian `## Deploy & rilis`:

```markdown
## Redesign UI — aturan yang berlaku sejak Fase 0

Spec: `docs/superpowers/specs/2026-09-18-ui-redesign-design.md`.
Aplikasi sedang bermigrasi dari Bootstrap ke Tailwind v4 secara bertahap
per rute. Selama masa transisi, keduanya aktif bersamaan.

- **Warna hanya boleh disebut lewat token semantik** di
  `src/styles/theme.css` (`--color-canvas`, `--color-fg`, `--color-line`,
  `--color-brand`, `--color-money-in`, dst) atau utility Tailwind yang
  dihasilkannya (`bg-canvas`, `text-fg-muted`, `border-line`). Satu hex
  literal atau satu warna inline akan rusak di salah satu tema tanpa
  ketahuan, karena yang berganti saat tema berganti hanyalah isi token.
- **Token lama di `src/styles/variable.css` masih dipakai halaman yang belum
  dimigrasi.** Jangan hapus sampai halaman terakhir pindah.
- **Preflight Tailwind sengaja dimatikan** di `src/styles/theme.css` — reset
  bawaannya menimpa gaya dasar Bootstrap yang masih aktif. Jangan ganti tiga
  baris `@import` di sana menjadi `@import "tailwindcss";` sebelum Bootstrap
  benar-benar dicabut.
- **Bootstrap dicabut paling akhir**, setelah halaman terakhir pindah.
- **Setiap token terang wajib punya pasangan gelap.** Dijaga oleh
  `src/styles/tokens.test.ts`; token yang terlewat membuat teks tidak
  terbaca di tema gelap.
- **Tema selalu ditulis sebagai nilai konkret** (`light`/`dark`) ke
  `<html data-theme>`, tidak pernah `system`. Aturannya ada di
  `src/lib/theme.ts`; script pra-paint di `index.html` menirunya dan kunci
  penyimpanannya dijaga test.
- **Inter Variable sudah di-bundle tapi belum diterapkan.** `--font-base`
  masih `'Segoe UI'` sampai Fase 2.
- **`background_color`/`theme_color` manifest PWA di `vite.config.ts` masih
  gelap.** Diubah di Fase 2, bersamaan dengan shell terang — mengubahnya
  lebih awal membuat splash PWA putih di atas aplikasi yang masih gelap.
```

- [ ] **Step 2: Jalankan gate lengkap**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint **0 error / 4 warning** · 90 test lolos (73 baseline + 17 baru).

- [ ] **Step 3: Jalankan checklist paritas fungsional**

Ini gate wajib dari §2.1 spec. Dengan `npm run dev`, konfirmasi setiap butir masih berfungsi:

- [ ] Login, logout, splash, rute terlindungi, pemilihan shell per role
- [ ] CRUD: Users, Approval User, Pengawas, Ladies, Agent, Outlet — daftar, cari, paginasi, tambah, ubah, hapus + konfirmasi
- [ ] Add Transaksi (ladies & pengawas) — harga per tier terisi benar
- [ ] Buku Kuning (×2) — saldo berjalan, ekspor PDF, Generate Biaya Bulanan
- [ ] Absensi — kalender, modal tambah, pemilih status, kartu rekap, hapus lewat geser
- [ ] Rekap Voucher — rentang tanggal, kelompok per outlet, total, ekspor PDF
- [ ] Performa Ladies — grafik, pengalih mode, rentang tanggal
- [ ] Smart Chat (admin & ladies)
- [ ] Ladies — Home (sembunyikan nominal, progres kehadiran), 4 buku, Riwayat Absensi, Peraturan, Profil
- [ ] Lonceng notifikasi ladies, PullToRefresh, OfflineBanner, toast
- [ ] PWA — masih bisa di-install, jalan standalone, deep link berfungsi

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: aturan redesign yang berlaku sejak Fase 0

Tanpa ini aturan fondasi cuma hidup di kepala orang yang mengerjakan
Fase 0, dan fase berikutnya akan melanggarnya tanpa sadar.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

- [ ] **Step 5: Deploy & verifikasi di produksi**

Push ke `main`, tunggu build Vercel selesai, lalu buka aplikasi produksi dan konfirmasi:

1. Tampilan **identik** dengan sebelum Fase 0.
2. `document.documentElement.getAttribute('data-theme')` mengembalikan `light` atau `dark`.
3. Berkas font Inter `.woff2` muncul di tab Network.
4. PWA yang sudah terpasang di HP masih terbuka normal setelah update.

**Fase 0 baru boleh dinyatakan selesai setelah keempatnya terkonfirmasi di produksi**, bukan di localhost. Fase 1 tidak dimulai sebelum itu.

---

## Catatan penyimpangan dari spec

Dua hal di bawah berbeda dari spec dan spec-nya perlu ikut diperbarui:

1. **Penamaan token.** Spec §3.1 memakai `--bg-canvas`, `--text-primary`,
   `--border-default`. Rencana ini memakai `--color-canvas`, `--color-fg`,
   `--color-line` karena Tailwind v4 hanya menghasilkan utility dari prefiks
   `--color-*`. Nilainya identik; hanya namanya yang berubah.
2. **Manifest PWA dipindah ke Fase 2.** Spec menaruhnya di Fase 0. Mengubah
   `theme_color` jadi putih sekarang akan membuat splash PWA putih sementara
   aplikasinya masih gelap — regresi terlihat, dan itu melanggar gate fase ini.
