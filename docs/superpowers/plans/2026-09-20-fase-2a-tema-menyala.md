# Fase 2a — Tema Menyala: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membuat seluruh aplikasi berganti ke tema terang dan memakai font Inter sekaligus — **tanpa mengubah satu pun tata letak halaman**.

**Architecture:** Token lama di `variable.css` tidak dihapus dan tidak diganti namanya; isinya yang diubah jadi dwi-tema. Di mana ada padanannya, token lama jadi alias token baru (`--color-bg: var(--color-canvas)`) sehingga ikut berganti sendiri saat tema berganti. Warna yang tidak punya padanan — kategori transaksi, skala abu — diberi nilai terang di `:root` dan nilai gelap (yaitu nilai yang berlaku hari ini) di `:root[data-theme='dark']`. Karena semua halaman sudah memakai token ini, seluruh aplikasi ikut berganti tanpa satu berkas halaman pun disentuh.

**Tech Stack:** Tailwind v4 (token dari Fase 0), Inter Variable, Bootstrap 5 (masih aktif), Vitest 4.

**Spec:** `docs/superpowers/specs/2026-09-18-ui-redesign-design.md`

## Global Constraints

- **Nol perubahan tata letak.** Yang berubah hanya warna dan huruf. Tidak ada padding, ukuran, posisi, atau struktur yang digeser. Kalau ada elemen yang berpindah tempat, itu bug.
- **Nol perubahan pada berkas di `src/features/`** kecuali dua perbaikan yang disebut eksplisit di Task 6.
- **Nol perubahan business logic dan autentikasi.**
- **Nama token lama tidak boleh diubah maupun dihapus.** Halaman memakainya di 100+ tempat; yang diubah hanya nilainya.
- **`theme.css` dan `variable.css` tidak boleh punya nama token yang sama** — dijaga `src/styles/tokens.test.ts`. Kalau butuh token baru, taruh di `theme.css` dengan nama yang belum dipakai.
- **Baseline yang harus tetap hijau:**
  - `npx tsc -b` → exit 0
  - `npm test` → 190 test di 21 berkas
  - `npm run lint` → **0 error, 5 warning** (pre-existing). Error tetap 0.
- **Komentar dan pesan commit dalam Bahasa Indonesia.**

## Peta warna lama → terang

Acuan tunggal untuk Task 1. Kolom "terang" adalah nilai baru di `:root`; kolom "gelap" adalah nilai yang berlaku hari ini dan pindah ke `:root[data-theme='dark']`.

| Token lama | Terang | Gelap (sekarang) |
|---|---|---|
| `--color-green` | `var(--color-brand)` | `#5b8def` |
| `--color-green-light` | `var(--color-brand-subtle)` | `#1c2740` |
| `--color-green-lighter` | `var(--color-subtle)` | `#141b2c` |
| `--color-accent` | `var(--color-brand-hover)` | `#2f4f8f` |
| `--color-bg` | `var(--color-canvas)` | `#0e0e10` |
| `--color-bg-rgb` | `255, 255, 255` | `14, 14, 16` |
| `--color-dark` | `var(--color-fg)` | `#edeef0` |
| `--color-surface` | `var(--color-card)` | `#17181a` |
| `--color-surface-2` | `var(--color-subtle)` | `#1e1f22` |
| `--color-gray-50` | `#fcfcfd` | `#0b0c0d` |
| `--color-gray-100` | `#f2f4f7` | `#1c1d20` |
| `--color-gray-200` | `#eaecf0` | `#24252a` |
| `--color-gray-300` | `#d0d5dd` | `#2f3136` |
| `--color-gray-400` | `#98a2b3` | `#5a5d63` |
| `--color-gray-500` | `#667085` | `#6f7278` |
| `--color-gray-600` | `#475467` | `#83868c` |
| `--color-gray-700` | `#344054` | `#9497a0` |
| `--color-gray-800` | `#1d2939` | `#c0c2c7` |
| `--color-gray-900` | `#101828` | `#edeef0` |
| `--color-warning` | `#fffaeb` | `#332711` |
| `--color-warning-hover` | `#fef0c7` | `#453516` |
| `--color-danger` | `#fef3f2` | `#33181b` |
| `--color-danger-hover` | `#fee4e2` | `#452226` |
| `--color-income` | `#067647` | `#57c98a` |
| `--color-income-soft` | `#ecfdf3` | `#10281c` |
| `--color-income-deep` | `#05603a` | `#15803d` |
| `--color-expense` | `#b42318` | `#e2666f` |
| `--color-expense-soft` | `#fef3f2` | `#33181b` |
| `--color-expense-deep` | `#912018` | `#b91c1c` |
| `--color-medical` | `#5925dc` | `#8b93f6` |
| `--color-medical-soft` | `#f4f3ff` | `#1c2040` |
| `--color-voucher` | `#b54708` | `#f2a94e` |
| `--color-voucher-soft` | `#fffaeb` | `#332711` |
| `--color-voucher-deep` | `#93370d` | `#a16207` |
| `--color-purple` | `#6941c6` | `#a78bfa` |
| `--color-purple-soft` | `#f4f3ff` | `#2a2340` |
| `--color-primary-rgb` | `79, 70, 229` | `47, 79, 143` |
| `--color-success-rgb` | `6, 118, 71` | `87, 201, 138` |
| `--color-warning-solid-rgb` | `181, 71, 8` | `242, 169, 78` |
| `--color-danger-solid-rgb` | `180, 35, 24` | `226, 102, 111` |

**Skala abu terbalik arah.** Di tema gelap `gray-50` paling gelap dan `gray-900` paling terang (dipakai untuk teks). Di terang urutannya kebalikan. Karena halaman memakai nama yang sama untuk peran yang sama (`gray-500` = teks redup, `gray-200` = garis), pembalikan ini justru yang membuat halaman lama otomatis benar.

**Tidak berubah antar tema:** `--color-white` (memang putih literal, dipakai di atas gradient), `--color-ink-on-warning` (teks di atas emas yang selalu terang), dan seluruh skala radius/shadow/spasi.

---

### Task 1: `variable.css` jadi dwi-tema

**Files:**
- Modify: `src/styles/variable.css`
- Test: `src/styles/tokens.test.ts`

**Interfaces:**
- Consumes: token baru dari `theme.css` (Fase 0/1a)
- Produces: seluruh token lama jadi peka tema; halaman lama ikut berganti tanpa disentuh

- [ ] **Step 1: Tulis test yang gagal**

Tambahkan di akhir `src/styles/tokens.test.ts`:

```ts
describe('token lama peka tema', () => {
  /**
   * Halaman yang belum dimigrasi masih memakai token di variable.css. Supaya
   * ikut berganti saat tema berganti, setiap token yang nilainya HARFIAH
   * (bukan alias `var(...)`) wajib punya pasangan di blok gelap. Token yang
   * berupa alias tidak perlu — ia mengikuti token baru yang sudah dwi-tema.
   */
  function ambilBlokDari(sumber: string, penanda: string): string {
    const mulai = sumber.indexOf(penanda);
    if (mulai === -1) throw new Error(`Blok "${penanda}" tidak ditemukan di variable.css`);
    const buka = sumber.indexOf('{', mulai);
    const tutup = sumber.indexOf('\n}', buka);
    return sumber.slice(buka, tutup);
  }

  function deklarasi(blok: string): { nama: string; nilai: string }[] {
    return [...blok.matchAll(/(--color-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => ({
      nama: m[1],
      nilai: m[2].trim(),
    }));
  }

  /** Sengaja sama di kedua tema: putih literal di atas gradient, dan tinta
      di atas warna emas yang memang selalu terang. */
  const SENGAJA_SAMA_LAMA = ['--color-white', '--color-ink-on-warning'];

  const terang = deklarasi(ambilBlokDari(cssLama, ':root {'));
  const gelap = deklarasi(ambilBlokDari(cssLama, "[data-theme='dark']"));
  const namaGelap = new Set(gelap.map((d) => d.nama));

  it('blok gelap ada dan berisi token', () => {
    expect(gelap.length).toBeGreaterThan(20);
  });

  it('setiap token berwarna harfiah punya pasangan gelap', () => {
    const kurang = terang
      .filter((d) => !d.nilai.startsWith('var('))
      .filter((d) => !SENGAJA_SAMA_LAMA.includes(d.nama))
      .filter((d) => !namaGelap.has(d.nama))
      .map((d) => d.nama);

    expect(kurang, `token tanpa nilai gelap: ${kurang.join(', ')}`).toEqual([]);
  });

  it('blok gelap tidak memperkenalkan token yang tidak ada di terang', () => {
    const namaTerang = new Set(terang.map((d) => d.nama));
    const asing = gelap.map((d) => d.nama).filter((n) => !namaTerang.has(n));
    expect(asing, `token hanya ada di gelap: ${asing.join(', ')}`).toEqual([]);
  });

  it('skala abu terbalik arah — gray-900 jadi teks gelap di tema terang', () => {
    const g900 = terang.find((d) => d.nama === '--color-gray-900')?.nilai;
    const g50 = terang.find((d) => d.nama === '--color-gray-50')?.nilai;
    expect(g900).toBe('#101828');
    expect(g50).toBe('#fcfcfd');
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx vitest run src/styles/tokens.test.ts`
Expected: FAIL — `Blok "[data-theme='dark']" tidak ditemukan di variable.css`.

- [ ] **Step 3: Tulis ulang variable.css**

Ganti **seluruh isi** `src/styles/variable.css` dengan:

```css
/* ===========================================================================
   TOKEN LAMA — sekarang peka tema.

   Berkas ini dipakai oleh setiap halaman yang belum dimigrasi ke Tailwind.
   Namanya SENGAJA dipertahankan (termasuk yang menyesatkan seperti
   `--color-green` yang sebenarnya biru) supaya tidak ada satu pun halaman
   yang perlu disentuh: yang berubah hanya isinya.

   Aturannya:
   - `:root` = tema TERANG (bawaan baru)
   - `:root[data-theme='dark']` = tema GELAP, yaitu nilai yang berlaku sebelum
     Fase 2a
   - Kalau ada padanan di theme.css, pakai alias `var(--color-...)` supaya
     satu sumber kebenaran dan tidak perlu diduplikasi ke blok gelap.

   Nama di sini TIDAK BOLEH sama dengan nama di theme.css — keduanya menulis
   ke :root dan theme.css diimpor belakangan. Dijaga tokens.test.ts.
   =========================================================================== */

:root {
  /* ===== Brand ===== */
  --color-green: var(--color-brand);
  --color-green-light: var(--color-brand-subtle);
  --color-green-lighter: var(--color-subtle);
  --color-accent: var(--color-brand-hover);

  --color-bg: var(--color-canvas);
  --color-bg-rgb: 255, 255, 255;
  --color-dark: var(--color-fg);
  --color-white: #ffffff;

  --color-surface: var(--color-card);
  --color-surface-2: var(--color-subtle);

  /* ===== Skala abu =====
     Perannya tetap: 50-300 tint permukaan/garis, 400-900 teks dari paling
     redup ke paling tegas. Arah nilainya yang terbalik dibanding tema gelap,
     dan justru itu yang membuat halaman lama otomatis benar. */
  --color-gray-50: #fcfcfd;
  --color-gray-100: #f2f4f7;
  --color-gray-200: #eaecf0;
  --color-gray-300: #d0d5dd;
  --color-gray-400: #98a2b3;
  --color-gray-500: #667085;
  --color-gray-600: #475467;
  --color-gray-700: #344054;
  --color-gray-800: #1d2939;
  --color-gray-900: #101828;

  /* ===== Status (latar lembut untuk badge/tombol soft) ===== */
  --color-warning: #fffaeb;
  --color-warning-hover: #fef0c7;
  --color-danger: #fef3f2;
  --color-danger-hover: #fee4e2;
  /* Teks di atas warning-solid/emas. Tidak ikut tema karena latarnya selalu
     warna terang di kedua tema. */
  --color-ink-on-warning: #1a1710;

  /* ===== Kategori transaksi =====
     Di tema terang warnanya harus lebih pekat: nilai gelap di bawah dipilih
     untuk kontras di atas latar hitam, dan akan pudar di atas putih. */
  --color-income: #067647;
  --color-income-soft: #ecfdf3;
  --color-income-deep: #05603a;
  --color-expense: #b42318;
  --color-expense-soft: #fef3f2;
  --color-expense-deep: #912018;
  --color-medical: #5925dc;
  --color-medical-soft: #f4f3ff;
  --color-voucher: #b54708;
  --color-voucher-soft: #fffaeb;
  --color-voucher-deep: #93370d;

  --color-purple: #6941c6;
  --color-purple-soft: #f4f3ff;

  /* ===== Semantic UI state =====
     Dipakai juga untuk menimpa variabel Bootstrap di global.css. Varian *-rgb
     dipakai box-shadow/focus-ring yang butuh format "r, g, b" dan karena itu
     tidak bisa berupa alias. */
  --color-primary: var(--color-brand);
  --color-primary-rgb: 79, 70, 229;
  --color-primary-hover: var(--color-brand-hover);
  --color-success: var(--color-income);
  --color-success-rgb: 6, 118, 71;
  --color-warning-solid: var(--color-voucher);
  --color-warning-solid-rgb: 181, 71, 8;
  --color-danger-solid: var(--color-expense);
  --color-danger-solid-rgb: 180, 35, 24;

  /* ===== Tipografi ===== */
  --font-base: var(--font-sans);
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.7;

  /* ===== Layout ===== */
  --header-height: 68px;

  /* ===== Spacing scale ===== */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;

  /* ===== Radius =====
     --radius-sm/md/lg/xl SENGAJA tidak ada di sini: pemiliknya `theme.css`.
     Jangan tambahkan kembali — itu tabrakan nama yang sudah pernah terjadi. */
  --radius: 0.75rem;
  --radius-full: 999px;
  --shadow: 0 1px 3px rgba(16, 24, 40, 0.1), 0 1px 2px rgba(16, 24, 40, 0.06);
  --shadow-sm: 0 1px 2px rgba(16, 24, 40, 0.05);
  --shadow-md: 0 4px 8px -2px rgba(16, 24, 40, 0.1), 0 2px 4px -2px rgba(16, 24, 40, 0.06);
  --shadow-lg: 0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03);
  --shadow-xl: 0 20px 24px -4px rgba(16, 24, 40, 0.08), 0 8px 8px -4px rgba(16, 24, 40, 0.03);
  --shadow-brand: 0 8px 16px -4px rgba(var(--color-primary-rgb), 0.24);
}

/* ===========================================================================
   TEMA GELAP — nilai yang berlaku sebelum Fase 2a.
   Hanya token dengan nilai harfiah yang perlu diulang di sini; yang berupa
   alias sudah mengikuti token baru di theme.css.
   =========================================================================== */
:root[data-theme='dark'] {
  --color-bg-rgb: 14, 14, 16;

  --color-gray-50: #0b0c0d;
  --color-gray-100: #1c1d20;
  --color-gray-200: #24252a;
  --color-gray-300: #2f3136;
  --color-gray-400: #5a5d63;
  --color-gray-500: #6f7278;
  --color-gray-600: #83868c;
  --color-gray-700: #9497a0;
  --color-gray-800: #c0c2c7;
  --color-gray-900: #edeef0;

  --color-warning: #332711;
  --color-warning-hover: #453516;
  --color-danger: #33181b;
  --color-danger-hover: #452226;

  --color-income: #57c98a;
  --color-income-soft: #10281c;
  --color-income-deep: #15803d;
  --color-expense: #e2666f;
  --color-expense-soft: #33181b;
  --color-expense-deep: #b91c1c;
  --color-medical: #8b93f6;
  --color-medical-soft: #1c2040;
  --color-voucher: #f2a94e;
  --color-voucher-soft: #332711;
  --color-voucher-deep: #a16207;

  --color-purple: #a78bfa;
  --color-purple-soft: #2a2340;

  --color-primary-rgb: 47, 79, 143;
  --color-success-rgb: 87, 201, 138;
  --color-warning-solid-rgb: 242, 169, 78;
  --color-danger-solid-rgb: 226, 102, 111;

  /* Bayangan perlu lebih pekat di atas latar gelap supaya tetap terbaca. */
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 8px -2px rgba(0, 0, 0, 0.45);
  --shadow-lg: 0 12px 16px -4px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 20px 24px -4px rgba(0, 0, 0, 0.55);
}
```

> Catatan: `--font-base` sekarang menunjuk `var(--font-sans)`, yaitu Inter. Itu bagian dari Task 3 tapi ditulis sekarang karena berkasnya sama — jangan kaget kalau font sudah berubah setelah task ini.

- [ ] **Step 4: Jalankan test, pastikan lolos**

Run: `npx vitest run src/styles/tokens.test.ts`
Expected: PASS — 13 test lolos (9 lama + 4 baru).

- [ ] **Step 5: Pastikan tidak ada tabrakan nama baru**

Run: `npx vitest run src/styles/tokens.test.ts -t "tidak ada satu pun nama token"`
Expected: PASS. Kalau gagal, ada nama di `variable.css` yang kembar dengan `theme.css` — ganti nama yang di `theme.css`, jangan yang di `variable.css`.

- [ ] **Step 6: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 5 warning · 194 test lolos.

- [ ] **Step 7: Commit**

```bash
git add src/styles/variable.css src/styles/tokens.test.ts
git commit -m "feat(tema): token lama jadi peka tema

Seluruh aplikasi ikut berganti ke terang tanpa satu berkas halaman pun
disentuh, karena semua halaman sudah memakai token ini. Nama token
dipertahankan apa adanya; hanya nilainya yang jadi dwi-tema.

Skala abu terbalik arah: di tema gelap gray-900 adalah warna teks paling
terang, di tema terang ia jadi yang paling gelap. Karena perannya sama,
pembalikan ini justru yang membuat halaman lama otomatis benar.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Jembatan Bootstrap ikut tema

`global.css` menimpa variabel internal Bootstrap, tapi sepuluh di antaranya ditulis sebagai angka RGB harfiah yang mengasumsikan tema gelap. Tanpa ini, komponen Bootstrap mentah (tabel, dropdown, form-control) tetap gelap di atas halaman terang.

**Files:**
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: token dari Task 1
- Produces: komponen Bootstrap ikut tema

- [ ] **Step 1: Tambahkan token RGB yang hilang ke variable.css**

Bootstrap butuh beberapa warna dalam format `r, g, b` yang belum punya token. Tambahkan di `:root` `src/styles/variable.css`, tepat setelah `--color-danger-solid-rgb`:

```css
  /* Dipakai jembatan Bootstrap di global.css yang menuntut format "r, g, b". */
  --color-fg-rgb: 16, 24, 40;
  --color-gray-500-rgb: 102, 112, 133;
  --color-gray-600-rgb: 71, 84, 103;
  --color-surface-rgb: 252, 252, 253;
  --color-subtle-rgb: 249, 250, 251;
```

Dan di blok `:root[data-theme='dark']`, tepat setelah `--color-danger-solid-rgb`:

```css
  --color-fg-rgb: 237, 238, 240;
  --color-gray-500-rgb: 111, 114, 120;
  --color-gray-600-rgb: 131, 134, 140;
  --color-surface-rgb: 23, 24, 26;
  --color-subtle-rgb: 30, 31, 34;
```

- [ ] **Step 2: Ganti angka harfiah di global.css dengan token**

Di `src/styles/global.css`, ganti baris-baris ini:

| Baris | Dari | Jadi |
|---|---|---|
| 44 | `--bs-link-hover-color-rgb: 61, 79, 57;` | `--bs-link-hover-color-rgb: var(--color-primary-rgb);` |
| 65 | `--bs-body-color-rgb: 237, 238, 240;` | `--bs-body-color-rgb: var(--color-fg-rgb);` |
| 69 | `--bs-emphasis-color-rgb: 237, 238, 240;` | `--bs-emphasis-color-rgb: var(--color-fg-rgb);` |
| 71 | `--bs-secondary-color-rgb: 131, 134, 140;` | `--bs-secondary-color-rgb: var(--color-gray-600-rgb);` |
| 73 | `--bs-secondary-bg-rgb: 30, 31, 34;` | `--bs-secondary-bg-rgb: var(--color-subtle-rgb);` |
| 75 | `--bs-tertiary-color-rgb: 111, 114, 120;` | `--bs-tertiary-color-rgb: var(--color-gray-500-rgb);` |
| 77 | `--bs-tertiary-bg-rgb: 23, 24, 26;` | `--bs-tertiary-bg-rgb: var(--color-surface-rgb);` |
| 87 | `--bs-dark-rgb: 237, 238, 240;` | `--bs-dark-rgb: var(--color-fg-rgb);` |
| 92 | `--bs-light-rgb: 23, 24, 26;` | `--bs-light-rgb: var(--color-surface-rgb);` |
| 97 | `--bs-secondary-rgb: 131, 134, 140;` | `--bs-secondary-rgb: var(--color-gray-600-rgb);` |

- [ ] **Step 3: Perbaiki garis translusen**

Di `src/styles/global.css` baris 79, ganti:

```css
  --bs-border-color-translucent: rgba(255, 255, 255, 0.1);
```

jadi:

```css
  /* Putih translusen hanya benar di atas latar gelap. Dipakai token garis
     biasa saja supaya ikut tema. */
  --bs-border-color-translucent: var(--color-gray-200);
```

- [ ] **Step 4: Verifikasi tidak ada angka RGB harfiah tersisa**

```powershell
Select-String -Path "src/styles/global.css" -Pattern '-rgb:\s*\d+,\s*\d+,\s*\d+'
```

Expected: tidak ada hasil.

- [ ] **Step 5: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 5 warning · 194 test lolos.

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css src/styles/variable.css
git commit -m "feat(tema): jembatan Bootstrap ikut tema

Sepuluh variabel Bootstrap ditulis sebagai angka RGB harfiah yang
mengasumsikan tema gelap. Tanpa ini, tabel, dropdown, dan form-control
Bootstrap mentah tetap gelap di atas halaman yang sudah terang.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Pastikan Inter benar-benar terpakai

`--font-base` sudah menunjuk `var(--font-sans)` sejak Task 1. Tersisa dua tempat yang memintanya sendiri-sendiri.

**Files:**
- Modify: `src/features/ladies/pages/RiwayatAbsensiPage.css`
- Modify: `index.html`

**Interfaces:**
- Consumes: `--font-sans` dari `theme.css` (Fase 0)
- Produces: satu keluarga huruf untuk seluruh aplikasi

- [ ] **Step 1: Samakan permintaan font di RiwayatAbsensiPage**

Berkas ini meminta `'Inter', sans-serif` langsung di dua tempat (baris 3 dan 19). Dulu itu tidak pernah termuat; sekarang Inter ada, tapi lebih baik menunjuk token supaya tidak ada dua sumber kebenaran.

Ganti kedua kemunculan:

```css
  font-family: 'Inter', sans-serif;
```

jadi:

```css
  font-family: var(--font-base);
```

- [ ] **Step 2: Samakan tumpukan font di index.html**

Di blok `<style>` anti-blink, ganti baris `font-family` jadi:

```css
        font-family: 'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

Ini berjalan sebelum CSS aplikasi termuat, jadi tidak bisa memakai token — tumpukannya sengaja ditulis sama persis dengan `--font-sans`.

- [ ] **Step 3: Verifikasi tidak ada permintaan font lain**

```powershell
Select-String -Path "src/**/*.css","src/**/*.tsx","index.html" -Pattern "font-family" | Where-Object { $_.Line -notmatch "var\(--font|inherit|Inter Variable" }
```

Expected: hanya `src/lib/supabaseClient.ts` (layar galat konfigurasi, ditangani di Task 6).

- [ ] **Step 4: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 5 warning · 194 test lolos.

- [ ] **Step 5: Commit**

```bash
git add src/features/ladies/pages/RiwayatAbsensiPage.css index.html
git commit -m "feat(tema): satu keluarga huruf untuk seluruh aplikasi

RiwayatAbsensiPage meminta 'Inter' langsung sejak lama padahal font itu
tidak pernah dimuat; sekarang menunjuk token yang sama dengan halaman
lain. Tumpukan di index.html disamakan supaya tidak ada pergeseran huruf
antara paint pertama dan setelah CSS termuat.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Chrome browser & PWA ikut tema

**Files:**
- Modify: `index.html`
- Modify: `vite.config.ts`

**Interfaces:**
- Consumes: hasil Task 1
- Produces: bilah status, splash PWA, dan latar sebelum paint ikut tema

- [ ] **Step 1: Buat anti-blink ikut tema**

Di `index.html`, blok `<style>` anti-blink sekarang mengunci `background-color: #0e0e10; color: white`. Ganti kedua nilai itu jadi:

```css
      html, body {
        margin: 0;
        padding: 0;
        /* Nilai bawaan = tema terang. Script di bawah menimpanya jadi gelap
           sebelum paint kalau tema yang berlaku memang gelap. */
        background-color: #ffffff;
        color: #101828;
        font-family: 'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }
      html[data-theme='dark'], html[data-theme='dark'] body {
        background-color: #09090b;
        color: #fafafa;
      }
```

- [ ] **Step 2: Buat meta theme-color ikut tema**

`<meta name="theme-color">` tidak bisa memakai CSS variable. Ganti baris:

```html
    <meta name="theme-color" content="#0e0e10" />
```

jadi dua baris yang dipilih browser sesuai preferensi sistem:

```html
    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#09090b" media="(prefers-color-scheme: dark)" />
```

Lalu, tepat sebelum `html.setAttribute('data-theme', ...)` di script pra-paint, tambahkan penyelarasan untuk pilihan manual:

```js
          var meta = document.querySelector(
            'meta[name="theme-color"]:not([media])',
          );
          if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'theme-color');
            document.head.appendChild(meta);
          }
          meta.setAttribute('content', gelap ? '#09090b' : '#ffffff');
```

Meta tanpa atribut `media` menang atas yang bermedia, sehingga pilihan manual pengguna tetap dihormati.

- [ ] **Step 3: Ubah warna manifest PWA**

Di `vite.config.ts`, ganti:

```ts
        background_color: '#0e0e10',
        theme_color: '#0e0e10',
```

jadi:

```ts
        // Terang, mengikuti tema bawaan. Manifest hanya menerima satu nilai,
        // jadi ini selalu memakai tema bawaan aplikasi.
        background_color: '#ffffff',
        theme_color: '#ffffff',
```

- [ ] **Step 4: Verifikasi di browser**

Run: `npm run dev`

1. Muat ulang halaman beberapa kali — **tidak boleh ada kedip gelap** sebelum konten muncul.
2. Di console: `localStorage.setItem('sr-theme','dark'); location.reload();` → muat ulang beberapa kali, **tidak boleh ada kedip terang**.
3. Kembalikan: `localStorage.removeItem('sr-theme'); location.reload();`

- [ ] **Step 5: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 5 warning · 194 test lolos.

Kalau test `script pra-paint di index.html` gagal, periksa bahwa `data-theme` masih ditulis sebelum `src/main.tsx` — penambahan meta tidak boleh mengubah urutan itu.

- [ ] **Step 6: Commit**

```bash
git add index.html vite.config.ts
git commit -m "feat(tema): bilah status, anti-kedip, dan splash PWA ikut tema

Anti-blink sebelumnya mengunci latar gelap, sehingga tema terang akan
berkedip hitam sebelum konten muncul. meta theme-color dipecah dua
berdasarkan preferensi sistem, dengan satu meta tanpa media yang ditulis
script pra-paint supaya pilihan manual pengguna tetap menang.

Manifest PWA jadi putih — ini yang sengaja ditunda dari Fase 0 karena
saat itu aplikasinya masih gelap.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Hapus animasi transisi rute

Animasi ini menambah jeda ±180ms di **setiap** perpindahan halaman tanpa memberi informasi apa pun. Menghapusnya membuat aplikasi langsung terasa lebih cepat, dan itu keputusan yang sudah disetujui di bagian C spec.

**Files:**
- Modify: `src/layout/MainLayout.tsx`

**Interfaces:**
- Consumes: tidak ada
- Produces: perpindahan halaman seketika

- [ ] **Step 1: Hapus pembungkus animasi**

Di `src/layout/MainLayout.tsx`, ganti blok ini:

```tsx
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
```

jadi:

```tsx
            {/* Tanpa animasi transisi: ia menambah jeda ~180ms di setiap
                perpindahan halaman tanpa memberi informasi apa pun. Animasi
                yang tersisa di aplikasi hanyalah yang menanggapi aksi
                pengguna secara langsung. */}
            {children}
```

- [ ] **Step 2: Bersihkan impor yang jadi tidak terpakai**

Di baris impor paling atas `src/layout/MainLayout.tsx`, hapus:

```tsx
import { motion, AnimatePresence } from 'framer-motion';
```

- [ ] **Step 3: Verifikasi lint menangkap sisa impor**

Run: `npm run lint`
Expected: 0 error. Kalau muncul error `'motion' is defined but never used`, berarti masih ada pemakaian lain di berkas itu — hapus juga.

- [ ] **Step 4: Verifikasi di browser**

Run: `npm run dev`. Klik antar halaman di sidebar — perpindahan harus terasa seketika, tanpa geser-naik atau pudar.

- [ ] **Step 5: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 5 warning · 194 test lolos.

- [ ] **Step 6: Commit**

```bash
git add src/layout/MainLayout.tsx
git commit -m "perf(ux): hapus animasi transisi antar halaman

Menambah jeda ~180ms di setiap perpindahan tanpa memberi informasi.
Animasi yang tersisa hanyalah yang menanggapi aksi pengguna langsung.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Perbaiki dua sisa yang mengasumsikan latar gelap, lalu tutup fase

Sapuan atas seluruh berkas menemukan bahwa hampir semua `rgba(255,255,255,…)` dan `color:#fff` berada **di atas gradient berwarna**, jadi tetap benar di tema terang. Hanya dua tempat yang benar-benar mengasumsikan latar gelap.

**Files:**
- Modify: `src/features/home/pages/HomePage.css`
- Modify: `src/lib/supabaseClient.ts`

**Interfaces:**
- Consumes: hasil Task 1–5
- Produces: tidak ada

- [ ] **Step 1: Perbaiki foto hero mobile**

`src/features/home/pages/HomePage.css` baris 35 meredupkan foto supaya menyatu dengan latar gelap. Di tema terang, foto segelap itu jadi lubang hitam. Ganti:

```css
    filter: brightness(0.38) saturate(0.75) contrast(1.05);
```

jadi:

```css
    /* Tema terang: foto cukup dilembutkan, tidak diredupkan — meredupkannya
       di atas latar putih justru membuatnya jadi lubang gelap. */
    filter: brightness(1.02) saturate(0.85) contrast(0.98);
    opacity: 0.35;
  }

  :root[data-theme='dark'] .home-bg-mobile {
    filter: brightness(0.38) saturate(0.75) contrast(1.05);
    opacity: 1;
```

Dan pada `.home-wrapper::before` di berkas yang sama, gradien penutupnya sudah memakai `var(--color-bg-rgb)` sehingga ikut tema sendiri — jangan diubah.

- [ ] **Step 2: Buat layar galat konfigurasi ikut tema**

`src/lib/supabaseClient.ts` menulis layar galat dengan warna harfiah gelap. Layar ini muncul saat env var hilang, yaitu sebelum aplikasi sempat jalan — tapi CSS sudah termuat, jadi tokennya tersedia. Ganti blok gaya inline-nya:

```ts
  document.body.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;
                padding:24px;background:var(--color-bg);color:var(--color-dark);
                font-family:var(--font-base);text-align:center">
      <div style="max-width:420px">
        <div style="font-size:40px;margin-bottom:16px">⚙️</div>
        <h1 style="font-size:20px;margin:0 0 12px">Konfigurasi belum lengkap</h1>
        <p style="font-size:14px;line-height:1.6;color:var(--color-gray-600);margin:0">
          Aplikasi tidak bisa terhubung ke server karena ${missing} tidak terpasang
          saat build. Hubungi admin untuk mengatur environment variable di hosting.
        </p>
      </div>
```

Sisa berkas tidak diubah.

- [ ] **Step 3: Sapuan visual dua tema**

Run: `npm run dev`. Untuk **setiap** halaman di bawah, periksa di tema terang lalu ulangi di tema gelap (`localStorage.setItem('sr-theme','dark')`):

- [ ] `/` — Home admin
- [ ] `/ladies` — daftar + cari + paginasi
- [ ] `/ladies-detail/<id>` — form detail
- [ ] `/add-transaksi` — pemilih ladies, form, riwayat
- [ ] `/buku-kuning` — saldo berjalan, modal Generate Biaya Bulanan
- [ ] `/absensi` — kalender, modal tambah, kartu rekap
- [ ] `/rekap-voucher` — rentang tanggal, kartu total
- [ ] `/performa-ladies` — grafik Recharts
- [ ] `/users`, `/user-approval`, `/pengawas`, `/agent`, `/outlet`
- [ ] `/smart-chat`
- [ ] `/login` dan `/signup`
- [ ] Ladies: `/ladies/home`, `/ladies/voucher`, `/ladies/absensi`, `/ladies/profile`, `/ladies/peraturan`

Yang dicari: **teks yang tidak terbaca** (kontras terlalu rendah), **kartu putih di atas putih**, dan **garis yang hilang**. Tata letak tidak boleh berubah sama sekali — kalau ada yang bergeser, itu bug.

Catat temuan; kalau ada yang rusak, perbaiki di berkas halamannya dengan mengganti nilai harfiah jadi token, bukan dengan menambah pengecualian tema.

- [ ] **Step 4: Jalankan gate lengkap**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 5 warning · 194 test lolos.

- [ ] **Step 5: Checklist paritas fungsional**

Seluruh daftar §2.1 spec, diperiksa ulang karena fase ini menyentuh berkas global:

- [ ] Login, logout, splash, rute terlindungi, pemilihan shell per role
- [ ] CRUD: Users, Approval, Pengawas, Ladies, Agent, Outlet — cari, paginasi, tambah, ubah, hapus + konfirmasi
- [ ] Add Transaksi (ladies & pengawas) — harga per tier terisi benar
- [ ] Buku Kuning ×2 — saldo berjalan, ekspor PDF, Generate Biaya Bulanan
- [ ] Absensi — kalender, modal, pemilih status, kartu rekap, hapus lewat geser
- [ ] Rekap Voucher & Performa Ladies — termasuk ekspor PDF
- [ ] Smart Chat admin & ladies
- [ ] Ladies — Home, 4 buku, Riwayat Absensi, Peraturan, Profil
- [ ] Lonceng notifikasi, PullToRefresh, OfflineBanner, toast
- [ ] PWA masih bisa di-install dan jalan standalone

> **Ekspor PDF perlu perhatian khusus.** `pdfReport.ts` punya paletnya sendiri yang tidak memakai token CSS, jadi PDF tidak ikut berubah tema — itu memang benar, PDF selalu dicetak di atas kertas putih. Yang diperiksa hanya bahwa PDF-nya masih terbentuk dan angkanya sama.

- [ ] **Step 6: Commit**

```bash
git add src/features/home/pages/HomePage.css src/lib/supabaseClient.ts
git commit -m "fix(tema): dua sisa yang mengasumsikan latar gelap

Foto hero mobile diredupkan brightness(0.38) untuk menyatu dengan latar
gelap; di tema terang itu jadi lubang hitam, jadi sekarang dilembutkan
dengan opacity dan versi gelapnya dipindah ke blok data-theme.

Layar galat konfigurasi di supabaseClient menulis warna harfiah gelap;
sekarang memakai token.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

- [ ] **Step 7: Deploy & verifikasi produksi**

Push ke `main`, tunggu Vercel, lalu di aplikasi produksi konfirmasi:

1. Tampilan terang di perangkat ber-OS terang, gelap di perangkat ber-OS gelap.
2. Tidak ada kedip warna saat memuat.
3. Huruf sudah Inter di **semua** perangkat, termasuk Android dan iOS — ini yang sebelumnya mustahil karena Segoe UI hanya ada di Windows.
4. PWA yang sudah terpasang masih terbuka normal, dan splash-nya tidak lagi hitam di tema terang.

---

## Setelah fase ini

Fase 2b menyusun shell baru: `AppShell`, sidebar berlabel grup (menggantikan
accordion yang tidak pernah menunjukkan posisi pengguna), sidebar ladies di
desktop (menggantikan teks "belum tersedia"), app bar mobile, `BottomNav`,
halaman Menu, dan `CommandPalette` — serta membubarkan `Header`.
