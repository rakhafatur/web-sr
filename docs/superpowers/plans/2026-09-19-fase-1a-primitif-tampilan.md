# Fase 1a — Primitif Tampilan: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun primitif tampilan pertama (`Button`, `Badge`, `Money`, `SectionCard`, `EmptyState`) di atas token Fase 0, plus halaman pratinjau `/ui` yang membuat kedua tema bisa dilihat berdampingan.

**Architecture:** Semua logika yang bisa dipisahkan dari DOM hidup di modul murni yang diuji tanpa browser (`src/lib/uang.ts`, `src/lib/statusMap.ts`). Komponen presentasi hanya menyusun utility Tailwind dari token — nol hex, nol inline style warna. Komponen baru ditaruh di `src/components/ui/` supaya jelas terpisah dari komponen lama yang masih Bootstrap, dan **belum dipasang di satu halaman aplikasi pun** — satu-satunya tempat pemakaiannya adalah halaman pratinjau `/ui` yang hanya terdaftar saat `import.meta.env.DEV`.

**Tech Stack:** React 19, Vite 6, TypeScript 5.8, Vitest 4, Tailwind v4 (token dari Fase 0), happy-dom + @testing-library/react (baru di fase ini), Bootstrap 5 (masih aktif, tidak disentuh).

**Spec:** `docs/superpowers/specs/2026-09-18-ui-redesign-design.md`

## Global Constraints

- **Nol perubahan pada halaman aplikasi yang sudah ada.** Fase ini tidak boleh menyentuh satu pun berkas di `src/features/` kecuali untuk dibaca. Rute `/ui` adalah satu-satunya permukaan baru, dan hanya ada di mode dev.
- **Nol perubahan business logic.** `src/features/*/utils/`, `src/hooks/`, `src/lib/supabaseClient.ts` tidak disentuh. Khususnya `src/features/transaction/utils/biayaBulanan.ts` punya `formatRupiah`-nya sendiri — **jangan disatukan di fase ini**, itu berkas perhitungan uang.
- **Nol perubahan autentikasi.**
- **Warna hanya lewat token semantik** dari `src/styles/theme.css` (`--color-canvas`, `--color-fg`, `--color-line`, `--color-brand`, `--color-money-in`, `--color-money-out`, status `*-bg`/`*-line`/`*-fg`) atau utility Tailwind yang dihasilkannya. Satu hex literal = pelanggaran.
- **Nol gradient, nol shadow pada kartu/panel.** Shadow hanya untuk overlay, dan overlay baru ada di Fase 1b.
- **Bobot huruf hanya 400/450/500/600.** Tidak ada `font-bold` (700) dan `font-extrabold` (800).
- **Tidak ada ukuran huruf di bawah 12px.**
- **Setiap komponen wajib punya state fokus yang terlihat** (`focus-visible`). Ini menutup temuan audit: saat ini nol aturan `:focus-visible` di seluruh proyek.
- **Baseline yang harus tetap hijau:**
  - `npx tsc -b` → exit 0
  - `npm test` → 90 test di 8 berkas, semua lolos
  - `npm run lint` → **0 error, 4 warning** (warning `react-refresh/only-export-components` di `ConfirmDialog.tsx`, `StatusBadge.tsx`, `AuthContext.tsx`, `ThemeContext.tsx`). Jangan perbaiki keempatnya di fase ini. Yang penting: **error tetap 0.**
- **Test co-located**: `nama.test.ts(x)` bersebelahan dengan sumbernya.
- **Komentar dan pesan commit dalam Bahasa Indonesia.**

## Struktur berkas

| Berkas | Tanggung jawab |
|---|---|
| `src/styles/theme.css` | (diperluas) skala radius & tipografi, di samping token warna Fase 0 |
| `src/lib/uang.ts` | Format rupiah — murni, tanpa React |
| `src/lib/statusMap.ts` | Pemetaan nilai status mentah dari database ke varian badge + label Indonesia |
| `src/components/ui/Button.tsx` | Tombol: 4 varian × 3 ukuran, state loading |
| `src/components/ui/Badge.tsx` | Pil status: 5 varian |
| `src/components/ui/Money.tsx` | Nominal rupiah: tabular, "Rp" diredupkan, tanda +/− semantik |
| `src/components/ui/SectionCard.tsx` | Kartu berjudul: pengganti band gradient yang sekarang di-copy di belasan tempat |
| `src/components/ui/EmptyState.tsx` | Keadaan kosong: ikon Feather, bukan emoji |
| `src/features/dev/pages/UiPreviewPage.tsx` | Pratinjau seluruh primitif di kedua tema. Hanya mode dev. |

---

### Task 1: Lengkapi skala radius & tipografi

Token warna sudah ada sejak Fase 0, tapi skala radius dan ukuran huruf belum. Tanpa ini, `rounded-md` masih bernilai 6px bawaan Tailwind (spec kita 8px) dan `text-base` masih 16px (spec kita 14px) — setiap komponen di task berikutnya akan salah ukuran.

**Files:**
- Modify: `src/styles/theme.css` (di dalam blok `@theme` yang sudah ada)
- Test: `src/styles/tokens.test.ts` (tambah blok `describe` baru)

**Interfaces:**
- Consumes: blok `@theme` dari Fase 0
- Produces: utility `rounded-sm|md|lg|xl`, `text-xs|sm|base|md|lg|xl|2xl|3xl|display`, dan kelas `.tabular`

- [ ] **Step 1: Tulis test yang gagal**

Tambahkan di akhir `src/styles/tokens.test.ts`:

```ts
describe('skala radius', () => {
  const blok = ambilBlok('@theme');

  it('mendefinisikan tepat lima nilai radius sesuai spec', () => {
    expect(blok).toContain('--radius-sm: 6px');
    expect(blok).toContain('--radius-md: 8px');
    expect(blok).toContain('--radius-lg: 12px');
    expect(blok).toContain('--radius-xl: 16px');
  });
});

describe('skala tipografi', () => {
  const blok = ambilBlok('@theme');

  it('tidak ada ukuran huruf di bawah 12px', () => {
    const ukuran = [...blok.matchAll(/--text-[a-z0-9]+:\s*(\d+)px/g)].map((m) =>
      Number(m[1]),
    );
    expect(ukuran.length).toBeGreaterThan(5);
    const terlaluKecil = ukuran.filter((u) => u < 12);
    expect(terlaluKecil, `ukuran < 12px: ${terlaluKecil.join(', ')}`).toEqual([]);
  });

  it('memakai skala spec, bukan bawaan Tailwind', () => {
    // Bawaan Tailwind: sm 14, base 16. Spec kita lebih padat.
    expect(blok).toContain('--text-sm: 13px');
    expect(blok).toContain('--text-base: 14px');
    // 16px khusus input di mobile (anti auto-zoom iOS).
    expect(blok).toContain('--text-md: 16px');
  });

  it('setiap ukuran huruf punya tinggi baris', () => {
    const ukuran = [...blok.matchAll(/--text-([a-z0-9]+):\s*\d+px/g)].map((m) => m[1]);
    const kurang = ukuran.filter(
      (nama) => !blok.includes(`--text-${nama}--line-height:`),
    );
    expect(kurang, `tanpa line-height: ${kurang.join(', ')}`).toEqual([]);
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx vitest run src/styles/tokens.test.ts`
Expected: FAIL — `expected '…' to contain '--radius-sm: 6px'`.

- [ ] **Step 3: Tambahkan skala ke theme.css**

Di `src/styles/theme.css`, di dalam blok `@theme`, tepat **setelah** deklarasi `--font-sans` dan **sebelum** komentar `/* Permukaan */`, sisipkan:

```css
  /* ===== Radius — lima nilai, menimpa skala bawaan Tailwind =====
     Tombol & input: md. Kartu: lg. Modal & bottom sheet: xl.
     Badge & avatar: rounded-full. Tidak ada angka lain di komponen. */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* ===== Tipografi — delapan ukuran, turun dari ±30 yang dipakai sekarang.
     Sengaja lebih padat dari bawaan Tailwind (sm 14 → 13, base 16 → 14):
     ini aplikasi operasional, bukan halaman bacaan. Tidak ada di bawah 12px. */
  --text-xs: 12px;
  --text-xs--line-height: 16px;
  --text-sm: 13px;
  --text-sm--line-height: 18px;
  --text-base: 14px;
  --text-base--line-height: 20px;
  --text-md: 16px;
  --text-md--line-height: 24px;
  --text-lg: 18px;
  --text-lg--line-height: 26px;
  --text-xl: 20px;
  --text-xl--line-height: 28px;
  --text-2xl: 24px;
  --text-2xl--line-height: 32px;
  --text-3xl: 30px;
  --text-3xl--line-height: 36px;
  --text-display: 36px;
  --text-display--line-height: 40px;
```

- [ ] **Step 4: Tambahkan utility angka tabular**

Di `src/styles/theme.css`, di paling bawah berkas (di luar blok `@theme`), tambahkan:

```css
/* Angka uang harus sejajar antar baris supaya kolom nominal bisa dibandingkan
   sekilas. Dipakai oleh <Money> dan setiap sel tabel berisi angka. */
.tabular {
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 5: Jalankan test, pastikan lolos**

Run: `npx vitest run src/styles/tokens.test.ts`
Expected: PASS — 8 test lolos (4 dari Fase 0 + 4 baru).

- [ ] **Step 6: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 4 warning · 94 test lolos.

- [ ] **Step 7: Commit**

```bash
git add src/styles/theme.css src/styles/tokens.test.ts
git commit -m "feat(tema): skala radius & tipografi

Menimpa skala bawaan Tailwind supaya sesuai spec: radius md jadi 8px
(bukan 6px) dan text-base jadi 14px (bukan 16px). Tanpa ini setiap
komponen di task berikutnya akan salah ukuran.

Test menjaga tidak ada ukuran huruf di bawah 12px — itu penyebab angka
rupiah tidak terbaca di HP pada versi sekarang.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Format rupiah terpusat

Audit menemukan `toLocaleString('id-ID')` dipakai di **19 tempat pada 12 berkas**, dengan tiga gaya berbeda: `Rp1.000`, `Rp 1.000`, dan `- Rp 1.000`. Ini yang membuat nominal terlihat tidak konsisten antar halaman.

**Files:**
- Create: `src/lib/uang.ts`
- Test: `src/lib/uang.test.ts`

**Interfaces:**
- Consumes: tidak ada
- Produces:
  - `formatRupiah(nilai: number): string` — hanya digit berpemisah titik, **tanpa** awalan "Rp" (awalan dirender terpisah oleh `<Money>` supaya bisa diredupkan)
  - `formatRupiahPenuh(nilai: number): string` — dengan awalan `Rp`, untuk PDF, `aria-label`, dan teks notifikasi
  - `type ArahUang = 'masuk' | 'keluar' | 'netral'`

- [ ] **Step 1: Tulis test yang gagal**

Buat `src/lib/uang.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatRupiah, formatRupiahPenuh } from './uang';

describe('formatRupiah', () => {
  it('memakai titik sebagai pemisah ribuan', () => {
    expect(formatRupiah(2700000)).toBe('2.700.000');
    expect(formatRupiah(450000)).toBe('450.000');
    expect(formatRupiah(1000)).toBe('1.000');
  });

  it('tidak menyertakan awalan Rp', () => {
    expect(formatRupiah(1000)).not.toContain('Rp');
  });

  it('menangani nol', () => {
    expect(formatRupiah(0)).toBe('0');
  });

  it('membulatkan pecahan — rupiah tidak punya sen di aplikasi ini', () => {
    expect(formatRupiah(1000.4)).toBe('1.000');
    expect(formatRupiah(1000.6)).toBe('1.001');
  });

  it('mengembalikan nilai absolut — tanda dirender terpisah', () => {
    expect(formatRupiah(-450000)).toBe('450.000');
  });

  it('tahan terhadap nilai tidak sah, tidak memuntahkan NaN ke layar', () => {
    expect(formatRupiah(Number.NaN)).toBe('0');
    expect(formatRupiah(Number.POSITIVE_INFINITY)).toBe('0');
  });
});

describe('formatRupiahPenuh', () => {
  it('menyertakan awalan Rp dengan spasi', () => {
    expect(formatRupiahPenuh(2700000)).toBe('Rp 2.700.000');
  });

  it('menyertakan tanda minus untuk nilai negatif', () => {
    expect(formatRupiahPenuh(-200000)).toBe('−Rp 200.000');
  });

  it('tidak memberi tanda pada nol', () => {
    expect(formatRupiahPenuh(0)).toBe('Rp 0');
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx vitest run src/lib/uang.test.ts`
Expected: FAIL — `Cannot find module './uang'`.

- [ ] **Step 3: Tulis implementasi**

Buat `src/lib/uang.ts`:

```ts
/**
 * Format nominal rupiah — satu-satunya tempat angka uang diubah jadi teks.
 *
 * Sebelum ini `toLocaleString('id-ID')` tersebar di 19 tempat pada 12 berkas
 * dengan tiga gaya berbeda ("Rp1.000", "Rp 1.000", "- Rp 1.000"), dan itu
 * yang membuat nominal terlihat tidak seragam antar halaman.
 *
 * CATATAN: `src/features/transaction/utils/biayaBulanan.ts` punya
 * formatter sendiri dan SENGAJA tidak disatukan di sini — berkas itu bagian
 * dari perhitungan uang yang tidak boleh disentuh oleh pekerjaan tampilan.
 */

/** Arah aliran uang, menentukan warna & tanda di <Money>. */
export type ArahUang = 'masuk' | 'keluar' | 'netral';

/** Angka tidak sah tidak boleh sampai ke layar sebagai "NaN". */
function amankan(nilai: number): number {
  return Number.isFinite(nilai) ? nilai : 0;
}

/**
 * Digit berpemisah titik, tanpa awalan dan tanpa tanda.
 * Awalan "Rp" dan tanda +/− dirender terpisah oleh <Money> supaya keduanya
 * bisa diberi warna dan bobot sendiri.
 */
export function formatRupiah(nilai: number): string {
  return Math.round(Math.abs(amankan(nilai))).toLocaleString('id-ID');
}

/**
 * Versi teks utuh — untuk PDF, aria-label, dan pesan notifikasi, yaitu
 * tempat-tempat yang tidak bisa merender elemen terpisah.
 * Memakai minus tipografis (−, U+2212), bukan tanda hubung.
 */
export function formatRupiahPenuh(nilai: number): string {
  const aman = amankan(nilai);
  const tanda = aman < 0 ? '−' : '';
  return `${tanda}Rp ${formatRupiah(aman)}`;
}
```

- [ ] **Step 4: Jalankan test, pastikan lolos**

Run: `npx vitest run src/lib/uang.test.ts`
Expected: PASS — 9 test lolos.

- [ ] **Step 5: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 4 warning · 103 test lolos.

- [ ] **Step 6: Commit**

```bash
git add src/lib/uang.ts src/lib/uang.test.ts
git commit -m "feat(uang): format rupiah terpusat

Menggantikan tiga gaya berbeda yang sekarang tersebar di 19 tempat.
Digit dipisah dari awalan 'Rp' supaya awalannya bisa diredupkan di
<Money> dan digitnya yang menonjol.

biayaBulanan.ts sengaja tidak ikut disatukan — itu berkas perhitungan
uang yang di luar ruang lingkup pekerjaan tampilan.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Pemetaan status terpusat

Audit menemukan pemetaan status ditulis sebagai `switch` berulang di setidaknya empat berkas, dan **dua di antaranya tidak sepakat**: `LadiesListPage.tsx:106` memetakan `'active'`/`'resign'`/`'not active'`, sementara `ProfilePage.tsx:27` memetakan `'AKTIF'`/`'NONAKTIF'` lewat `status?.toUpperCase()`. Karena `'active'.toUpperCase()` menghasilkan `'ACTIVE'` dan bukan `'AKTIF'`, salah satu dari keduanya kemungkinan besar tidak pernah cocok dan selalu jatuh ke `default`. Pemetaan terpusat yang menerima kedua ejaan menutup itu tanpa perlu tahu lebih dulu mana yang benar.

**Files:**
- Create: `src/lib/statusMap.ts`
- Test: `src/lib/statusMap.test.ts`

**Interfaces:**
- Consumes: tidak ada
- Produces:
  - `type VarianStatus = 'success' | 'warning' | 'danger' | 'neutral' | 'brand'`
  - `type InfoStatus = { varian: VarianStatus; label: string }`
  - `petakanStatus(mentah: string | null | undefined): InfoStatus`
  - `petakanKategori(mentah: string | null | undefined): InfoStatus`

- [ ] **Step 1: Tulis test yang gagal**

Buat `src/lib/statusMap.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { petakanKategori, petakanStatus } from './statusMap';

describe('petakanStatus', () => {
  it('memetakan status ladies dari database', () => {
    expect(petakanStatus('active')).toEqual({ varian: 'success', label: 'Aktif' });
    expect(petakanStatus('not active')).toEqual({ varian: 'warning', label: 'Nonaktif' });
    expect(petakanStatus('resign')).toEqual({ varian: 'danger', label: 'Resign' });
  });

  it('menerima ejaan Indonesia yang dipakai ProfilePage', () => {
    expect(petakanStatus('AKTIF')).toEqual({ varian: 'success', label: 'Aktif' });
    expect(petakanStatus('NONAKTIF')).toEqual({ varian: 'warning', label: 'Nonaktif' });
  });

  it('tidak peduli besar-kecil huruf maupun spasi berlebih', () => {
    expect(petakanStatus('  ACTIVE  ')).toEqual({ varian: 'success', label: 'Aktif' });
    expect(petakanStatus('Not Active')).toEqual({ varian: 'warning', label: 'Nonaktif' });
    expect(petakanStatus('not_active')).toEqual({ varian: 'warning', label: 'Nonaktif' });
  });

  it('memetakan status absensi', () => {
    expect(petakanStatus('KERJA')).toEqual({ varian: 'success', label: 'Kerja' });
    expect(petakanStatus('OFF')).toEqual({ varian: 'neutral', label: 'Off' });
    expect(petakanStatus('SAKIT')).toEqual({ varian: 'warning', label: 'Sakit' });
    expect(petakanStatus('MENS')).toEqual({ varian: 'danger', label: 'Mens' });
  });

  it('menampilkan nilai apa adanya kalau tidak dikenal — jangan sembunyikan data', () => {
    expect(petakanStatus('entah')).toEqual({ varian: 'neutral', label: 'entah' });
  });

  it('memberi tanda strip kalau kosong', () => {
    expect(petakanStatus(null)).toEqual({ varian: 'neutral', label: '-' });
    expect(petakanStatus(undefined)).toEqual({ varian: 'neutral', label: '-' });
    expect(petakanStatus('   ')).toEqual({ varian: 'neutral', label: '-' });
  });
});

describe('petakanKategori', () => {
  it('memetakan kategori transaksi ladies', () => {
    expect(petakanKategori('voucher')).toEqual({ varian: 'warning', label: 'Voucher' });
    expect(petakanKategori('kasbon')).toEqual({ varian: 'danger', label: 'Kasbon' });
    expect(petakanKategori('dokter')).toEqual({ varian: 'brand', label: 'Dokter' });
    expect(petakanKategori('pemasukan_lain')).toEqual({
      varian: 'success',
      label: 'Pemasukan Lain',
    });
  });

  it('memetakan kategori transaksi pengawas', () => {
    expect(petakanKategori('kasbon_pengawas')).toEqual({
      varian: 'danger',
      label: 'Kasbon Pengawas',
    });
    expect(petakanKategori('gaji_pengawas')).toEqual({
      varian: 'success',
      label: 'Gaji Pengawas',
    });
  });

  it('merapikan kategori tidak dikenal jadi Title Case, bukan snake_case mentah', () => {
    expect(petakanKategori('biaya_bulanan')).toEqual({
      varian: 'neutral',
      label: 'Biaya Bulanan',
    });
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx vitest run src/lib/statusMap.test.ts`
Expected: FAIL — `Cannot find module './statusMap'`.

- [ ] **Step 3: Tulis implementasi**

Buat `src/lib/statusMap.ts`:

```ts
/**
 * Pemetaan nilai status mentah dari database ke varian badge + label Indonesia.
 *
 * Sebelum ini pemetaannya ditulis sebagai `switch` berulang di LadiesListPage,
 * LadiesCardList, ProfilePage, CardTableAbsensi, dan dua komponen riwayat
 * transaksi — dan dua di antaranya tidak sepakat soal ejaan. LadiesListPage
 * memakai 'active'/'resign'/'not active' (huruf kecil), ProfilePage memakai
 * 'AKTIF'/'NONAKTIF'. Keduanya diterima di sini supaya tidak perlu lebih dulu
 * memastikan mana yang benar-benar tersimpan di Supabase.
 */

export type VarianStatus = 'success' | 'warning' | 'danger' | 'neutral' | 'brand';

export type InfoStatus = {
  varian: VarianStatus;
  label: string;
};

/** Samakan ejaan: huruf kecil, tanpa spasi tepi, garis bawah jadi spasi. */
function normalkan(mentah: string): string {
  return mentah.trim().toLowerCase().replace(/_/g, ' ');
}

/** "pemasukan lain" → "Pemasukan Lain". Dipakai sebagai cadangan supaya nilai
    tak dikenal tetap terbaca manusiawi, bukan snake_case mentah. */
function keTitleCase(teks: string): string {
  return teks
    .split(' ')
    .map((kata) => kata.charAt(0).toUpperCase() + kata.slice(1))
    .join(' ');
}

const STATUS: Record<string, InfoStatus> = {
  // Ladies — ejaan database
  active: { varian: 'success', label: 'Aktif' },
  'not active': { varian: 'warning', label: 'Nonaktif' },
  resign: { varian: 'danger', label: 'Resign' },
  // Ladies — ejaan Indonesia yang dipakai ProfilePage
  aktif: { varian: 'success', label: 'Aktif' },
  nonaktif: { varian: 'warning', label: 'Nonaktif' },
  // Absensi
  kerja: { varian: 'success', label: 'Kerja' },
  off: { varian: 'neutral', label: 'Off' },
  sakit: { varian: 'warning', label: 'Sakit' },
  mens: { varian: 'danger', label: 'Mens' },
};

const KATEGORI: Record<string, InfoStatus> = {
  voucher: { varian: 'warning', label: 'Voucher' },
  kasbon: { varian: 'danger', label: 'Kasbon' },
  dokter: { varian: 'brand', label: 'Dokter' },
  'pemasukan lain': { varian: 'success', label: 'Pemasukan Lain' },
  'kasbon pengawas': { varian: 'danger', label: 'Kasbon Pengawas' },
  'gaji pengawas': { varian: 'success', label: 'Gaji Pengawas' },
};

function petakan(
  tabel: Record<string, InfoStatus>,
  mentah: string | null | undefined,
): InfoStatus {
  if (!mentah || !mentah.trim()) return { varian: 'neutral', label: '-' };

  const kunci = normalkan(mentah);
  const cocok = tabel[kunci];
  if (cocok) return cocok;

  // Nilai tak dikenal ditampilkan apa adanya — menyembunyikannya justru
  // membuat data aneh sulit ketahuan.
  return { varian: 'neutral', label: keTitleCase(kunci) };
}

export function petakanStatus(mentah: string | null | undefined): InfoStatus {
  if (!mentah || !mentah.trim()) return { varian: 'neutral', label: '-' };

  const kunci = normalkan(mentah);
  const cocok = STATUS[kunci];
  if (cocok) return cocok;

  // Status tak dikenal ditampilkan persis seperti tersimpan, tanpa dirapikan —
  // supaya nilai yang salah di database langsung terlihat mencurigakan.
  return { varian: 'neutral', label: mentah.trim() };
}

export function petakanKategori(mentah: string | null | undefined): InfoStatus {
  return petakan(KATEGORI, mentah);
}
```

- [ ] **Step 4: Jalankan test, pastikan lolos**

Run: `npx vitest run src/lib/statusMap.test.ts`
Expected: PASS — 9 test lolos.

- [ ] **Step 5: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 4 warning · 112 test lolos.

- [ ] **Step 6: Commit**

```bash
git add src/lib/statusMap.ts src/lib/statusMap.test.ts
git commit -m "feat(status): pemetaan status & kategori terpusat

Menggantikan switch yang diulang di enam berkas. Dua di antaranya tidak
sepakat soal ejaan — LadiesListPage memakai 'active'/'resign', ProfilePage
memakai 'AKTIF'/'NONAKTIF' — sehingga salah satunya kemungkinan selalu
jatuh ke default. Keduanya diterima di sini.

Status tak dikenal tetap ditampilkan apa adanya supaya data aneh di
database langsung kelihatan, bukan disembunyikan jadi strip.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Pasang uji DOM & bangun `Button`

Primitif berikutnya punya perilaku yang tidak bisa diuji tanpa DOM (state loading mengunci tombol, cincin fokus, atribut aksesibilitas). Fase 1b nanti butuh ini lebih lagi untuk focus trap dan tombol Escape pada overlay, jadi dipasang sekarang.

Lingkungan DOM dipasang **per-berkas** lewat komentar `@vitest-environment`, bukan global — supaya 112 test murni yang sudah ada tetap jalan di lingkungan node yang lebih cepat.

**Files:**
- Modify: `package.json` (dependensi dev)
- Create: `src/components/ui/Button.tsx`
- Test: `src/components/ui/Button.test.tsx`

**Interfaces:**
- Consumes: token radius & tipografi dari Task 1
- Produces:
  - `type VarianTombol = 'primary' | 'secondary' | 'ghost' | 'danger'`
  - `type UkuranTombol = 'sm' | 'md' | 'lg'`
  - `Button` — props: `variant?: VarianTombol` (bawaan `'secondary'`), `size?: UkuranTombol` (bawaan `'md'`), `loading?: boolean`, `icon?: ReactNode`, `fullWidth?: boolean`, `children: ReactNode`, ditambah seluruh atribut `<button>` bawaan kecuali `className` dan `style`

- [ ] **Step 1: Pasang lingkungan uji DOM**

```bash
npm install -D happy-dom @testing-library/react
```

- [ ] **Step 2: Tulis test yang gagal**

Buat `src/components/ui/Button.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('menampilkan labelnya', () => {
    render(<Button>Simpan</Button>);
    expect(screen.getByRole('button', { name: 'Simpan' })).toBeTruthy();
  });

  it('bertipe button secara bawaan, supaya tidak mengirim form tanpa sengaja', () => {
    render(<Button>Batal</Button>);
    const tombol = screen.getByRole('button') as HTMLButtonElement;
    expect(tombol.type).toBe('button');
  });

  it('meneruskan onClick', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Klik</Button>);
    screen.getByRole('button').click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('saat loading: tombol nonaktif dan klik tidak diteruskan', () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Simpan
      </Button>,
    );
    const tombol = screen.getByRole('button') as HTMLButtonElement;
    expect(tombol.disabled).toBe(true);
    tombol.click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('saat loading: label tetap terlihat supaya lebar tombol tidak melompat', () => {
    render(<Button loading>Simpan</Button>);
    expect(screen.getByRole('button').textContent).toContain('Simpan');
  });

  it('saat loading: mengumumkan kesibukan ke pembaca layar', () => {
    render(<Button loading>Simpan</Button>);
    expect(screen.getByRole('button').getAttribute('aria-busy')).toBe('true');
  });

  it('disabled biasa juga tidak meneruskan klik', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Simpan
      </Button>,
    );
    screen.getByRole('button').click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('punya cincin fokus yang terlihat — nol :focus-visible adalah temuan audit', () => {
    render(<Button>Simpan</Button>);
    expect(screen.getByRole('button').className).toContain('focus-visible:ring-2');
  });

  it('tidak memakai bobot huruf 700/800 yang dilarang spec', () => {
    render(<Button variant="primary">Simpan</Button>);
    const kelas = screen.getByRole('button').className;
    expect(kelas).not.toContain('font-bold');
    expect(kelas).not.toContain('font-extrabold');
  });

  it('tidak memakai gradient', () => {
    render(<Button variant="primary">Simpan</Button>);
    expect(screen.getByRole('button').className).not.toContain('gradient');
  });
});
```

- [ ] **Step 3: Jalankan test, pastikan gagal**

Run: `npx vitest run src/components/ui/Button.test.tsx`
Expected: FAIL — `Cannot find module './Button'`.

- [ ] **Step 4: Tulis implementasi**

Buat `src/components/ui/Button.tsx`:

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type VarianTombol = 'primary' | 'secondary' | 'ghost' | 'danger';
export type UkuranTombol = 'sm' | 'md' | 'lg';

type Props = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'style'
> & {
  variant?: VarianTombol;
  size?: UkuranTombol;
  /** Mengunci tombol dan menampilkan pemutar, label tetap terlihat. */
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
};

/* Nol gradient dan nol colored shadow — itu yang membuat versi lama terlihat
   seperti template. Penekanan datang dari warna isian, bukan dari efek. */
const VARIAN: Record<VarianTombol, string> = {
  primary: 'bg-brand text-fg-on-brand hover:bg-brand-hover',
  secondary:
    'bg-surface text-fg border border-line-strong hover:bg-hover',
  ghost: 'text-fg-muted hover:bg-hover',
  danger: 'bg-danger-solid text-fg-on-brand hover:brightness-95',
};

/* Tinggi 44px di ukuran lg karena itu target sentuh minimum di mobile. */
const UKURAN: Record<UkuranTombol, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
  lg: 'h-11 px-4 text-base gap-2',
};

const DASAR = [
  'inline-flex items-center justify-center',
  'rounded-md font-medium whitespace-nowrap',
  'transition-colors duration-150',
  // Cincin fokus: proyek ini sebelumnya tidak punya satu pun aturan
  // :focus-visible, sehingga navigasi keyboard praktis tak terlihat.
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
  'disabled:opacity-50 disabled:pointer-events-none',
].join(' ');

/** Pemutar kecil untuk state loading. `aria-hidden` karena kesibukan sudah
    diumumkan lewat `aria-busy` pada tombolnya. */
const Pemutar = () => (
  <svg
    className="animate-spin size-4 shrink-0"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
    <path d="M14.5 8A6.5 6.5 0 0 0 8 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Button = ({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  children,
  disabled,
  type = 'button',
  ...sisanya
}: Props) => (
  <button
    {...sisanya}
    type={type}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={[
      DASAR,
      UKURAN[size],
      VARIAN[variant],
      fullWidth ? 'w-full' : '',
    ].join(' ')}
  >
    {loading ? <Pemutar /> : icon}
    {children}
  </button>
);

export default Button;
```

- [ ] **Step 5: Jalankan test, pastikan lolos**

Run: `npx vitest run src/components/ui/Button.test.tsx`
Expected: PASS — 10 test lolos.

- [ ] **Step 6: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 4 warning · 122 test lolos.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/components/ui/Button.tsx src/components/ui/Button.test.tsx
git commit -m "feat(ui): primitif Button tanpa gradient

Empat varian x tiga ukuran, state loading yang mengunci tombol tanpa
membuat lebarnya melompat. Menggantikan tombol lama yang semuanya
gradient dengan bayangan berwarna 25px — itu yang bikin semua tombol
berteriak sama keras tanpa hierarki.

Cincin focus-visible dipasang sejak primitif pertama: proyek ini
sebelumnya tidak punya satu pun aturan :focus-visible.

happy-dom dipasang per-berkas lewat komentar @vitest-environment supaya
test murni yang sudah ada tetap jalan di lingkungan node.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: `Badge` dan `Money`

**Files:**
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/Money.tsx`
- Test: `src/components/ui/Badge.test.tsx`
- Test: `src/components/ui/Money.test.tsx`

**Interfaces:**
- Consumes: `VarianStatus` dari `src/lib/statusMap.ts` (Task 3), `formatRupiah` / `formatRupiahPenuh` / `ArahUang` dari `src/lib/uang.ts` (Task 2)
- Produces:
  - `Badge` — props: `variant?: VarianStatus` (bawaan `'neutral'`), `children: ReactNode`
  - `Money` — props: `value: number`, `arah?: ArahUang` (bawaan `'netral'`), `tampilkanTanda?: boolean` (bawaan `false`), `ukuran?: 'sm' | 'base' | 'lg' | 'display'` (bawaan `'base'`)

- [ ] **Step 1: Tulis test yang gagal**

Buat `src/components/ui/Badge.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Badge from './Badge';

describe('Badge', () => {
  it('menampilkan labelnya', () => {
    render(<Badge variant="success">Aktif</Badge>);
    expect(screen.getByText('Aktif')).toBeTruthy();
  });

  it('memakai token status, bukan hex literal', () => {
    render(<Badge variant="success">Aktif</Badge>);
    const kelas = screen.getByText('Aktif').className;
    expect(kelas).toContain('bg-success-bg');
    expect(kelas).toContain('text-success-fg');
    expect(kelas).toContain('border-success-line');
  });

  it('varian neutral dipakai kalau tidak disebutkan', () => {
    render(<Badge>Entah</Badge>);
    expect(screen.getByText('Entah').className).toContain('bg-subtle');
  });

  it('punya border — pil tanpa border sulit dibedakan dari latar di tema gelap', () => {
    render(<Badge variant="danger">Resign</Badge>);
    expect(screen.getByText('Resign').className).toContain('border');
  });
});
```

Buat `src/components/ui/Money.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Money from './Money';

describe('Money', () => {
  it('menampilkan Rp dan digit berpemisah titik', () => {
    render(<Money value={2700000} />);
    expect(screen.getByText('Rp')).toBeTruthy();
    expect(screen.getByText('2.700.000')).toBeTruthy();
  });

  it('memakai angka tabular supaya digit sejajar antar baris', () => {
    const { container } = render(<Money value={1000} />);
    expect(container.firstElementChild?.className).toContain('tabular');
  });

  it('meredupkan awalan Rp supaya digitnya yang terbaca lebih dulu', () => {
    render(<Money value={1000} />);
    expect(screen.getByText('Rp').className).toContain('text-fg-faint');
  });

  it('uang masuk memakai warna money-in', () => {
    const { container } = render(<Money value={450000} arah="masuk" />);
    expect(container.firstElementChild?.className).toContain('text-money-in');
  });

  it('uang keluar memakai warna money-out', () => {
    const { container } = render(<Money value={200000} arah="keluar" />);
    expect(container.firstElementChild?.className).toContain('text-money-out');
  });

  it('tanda +/- ditampilkan kalau diminta — warna saja tidak cukup untuk buta warna', () => {
    render(<Money value={450000} arah="masuk" tampilkanTanda />);
    expect(screen.getByText(/\+/)).toBeTruthy();
  });

  it('memakai minus tipografis, bukan tanda hubung', () => {
    const { container } = render(<Money value={200000} arah="keluar" tampilkanTanda />);
    expect(container.textContent).toContain('−');
    expect(container.textContent).not.toContain('-Rp');
  });

  it('memberi label utuh untuk pembaca layar', () => {
    const { container } = render(<Money value={2700000} />);
    expect(container.firstElementChild?.getAttribute('aria-label')).toBe('Rp 2.700.000');
  });

  it('ukuran display dipakai untuk nominal utama Home Ladies', () => {
    const { container } = render(<Money value={2700000} ukuran="display" />);
    expect(container.firstElementChild?.className).toContain('text-display');
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx vitest run src/components/ui/Badge.test.tsx src/components/ui/Money.test.tsx`
Expected: FAIL — `Cannot find module './Badge'` dan `Cannot find module './Money'`.

- [ ] **Step 3: Tulis `Badge`**

Buat `src/components/ui/Badge.tsx`:

```tsx
import type { ReactNode } from 'react';
import type { VarianStatus } from '../../lib/statusMap';

type Props = {
  variant?: VarianStatus;
  children: ReactNode;
};

/* Setiap varian: latar lembut + border + teks berwarna. Border-nya penting —
   di tema gelap, pil tanpa border hampir menyatu dengan permukaan kartu. */
const VARIAN: Record<VarianStatus, string> = {
  success: 'bg-success-bg text-success-fg border-success-line',
  warning: 'bg-warning-bg text-warning-fg border-warning-line',
  danger: 'bg-danger-bg text-danger-fg border-danger-line',
  brand: 'bg-brand-subtle text-brand-fg border-brand-subtle',
  neutral: 'bg-subtle text-fg-muted border-line',
};

/** Pil status. Pemetaan nilai mentah ke varian ada di `src/lib/statusMap.ts` —
    komponen ini sengaja tidak tahu apa-apa soal nilai database. */
const Badge = ({ variant = 'neutral', children }: Props) => (
  <span
    className={[
      'inline-flex items-center rounded-full border',
      'px-2 py-0.5 text-xs font-medium whitespace-nowrap',
      VARIAN[variant],
    ].join(' ')}
  >
    {children}
  </span>
);

export default Badge;
```

- [ ] **Step 4: Tulis `Money`**

Buat `src/components/ui/Money.tsx`:

```tsx
import { formatRupiah, formatRupiahPenuh, type ArahUang } from '../../lib/uang';

type UkuranUang = 'sm' | 'base' | 'lg' | 'display';

type Props = {
  value: number;
  /** Menentukan warna. 'netral' memakai warna teks biasa. */
  arah?: ArahUang;
  /** Tampilkan + / − di depan. Warna saja tidak cukup bagi pengguna buta warna. */
  tampilkanTanda?: boolean;
  ukuran?: UkuranUang;
};

const WARNA: Record<ArahUang, string> = {
  masuk: 'text-money-in',
  keluar: 'text-money-out',
  netral: 'text-fg',
};

const UKURAN: Record<UkuranUang, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  display: 'text-display tracking-tight',
};

/** Awalan "Rp" selalu lebih kecil & redup dari digitnya: yang dibaca orang
    adalah angkanya, bukan mata uangnya. */
const AWALAN: Record<UkuranUang, string> = {
  sm: 'text-xs',
  base: 'text-xs',
  lg: 'text-sm',
  display: 'text-xl',
};

/**
 * Satu-satunya cara menampilkan nominal rupiah di UI baru.
 *
 * Angka memakai `tabular-nums` supaya digit sejajar antar baris — tanpa itu
 * kolom nominal di tabel tidak bisa dibandingkan sekilas.
 */
const Money = ({
  value,
  arah = 'netral',
  tampilkanTanda = false,
  ukuran = 'base',
}: Props) => {
  const tanda = !tampilkanTanda || arah === 'netral' ? '' : arah === 'masuk' ? '+' : '−';

  return (
    <span
      className={[
        'tabular inline-flex items-baseline gap-1 font-medium',
        UKURAN[ukuran],
        WARNA[arah],
      ].join(' ')}
      aria-label={`${tanda}${formatRupiahPenuh(Math.abs(value))}`}
    >
      {tanda && <span aria-hidden="true">{tanda}</span>}
      <span className={`${AWALAN[ukuran]} text-fg-faint font-normal`} aria-hidden="true">
        Rp
      </span>
      <span aria-hidden="true">{formatRupiah(value)}</span>
    </span>
  );
};

export default Money;
```

- [ ] **Step 5: Jalankan test, pastikan lolos**

Run: `npx vitest run src/components/ui/Badge.test.tsx src/components/ui/Money.test.tsx`
Expected: PASS — 13 test lolos (4 Badge + 9 Money).

- [ ] **Step 6: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 4 warning · 135 test lolos.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/Badge.tsx src/components/ui/Badge.test.tsx src/components/ui/Money.tsx src/components/ui/Money.test.tsx
git commit -m "feat(ui): primitif Badge & Money

Badge memisahkan tampilan dari pemetaan nilai database — nilai mentah
diterjemahkan di statusMap, komponennya tidak tahu apa-apa soal itu.

Money membuat nominal jadi tabular dan meredupkan awalan Rp supaya
digitnya yang terbaca lebih dulu. Tanda +/- opsional karena warna saja
tidak cukup bagi pengguna buta warna.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: `SectionCard` dan `EmptyState`

**Files:**
- Create: `src/components/ui/SectionCard.tsx`
- Create: `src/components/ui/EmptyState.tsx`
- Test: `src/components/ui/SectionCard.test.tsx`
- Test: `src/components/ui/EmptyState.test.tsx`

**Interfaces:**
- Consumes: tidak ada dari task sebelumnya
- Produces:
  - `SectionCard` — props: `title?: ReactNode`, `subtitle?: ReactNode`, `actions?: ReactNode`, `padding?: boolean` (bawaan `true`), `children: ReactNode`
  - `EmptyState` — props: `icon: ReactNode`, `title: string`, `description?: string`, `action?: ReactNode`

- [ ] **Step 1: Tulis test yang gagal**

Buat `src/components/ui/SectionCard.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SectionCard from './SectionCard';

describe('SectionCard', () => {
  it('menampilkan isinya', () => {
    render(<SectionCard>Isi kartu</SectionCard>);
    expect(screen.getByText('Isi kartu')).toBeTruthy();
  });

  it('menampilkan judul sebagai heading supaya struktur halaman terbaca', () => {
    render(<SectionCard title="Riwayat Transaksi">Isi</SectionCard>);
    expect(screen.getByRole('heading', { name: 'Riwayat Transaksi' })).toBeTruthy();
  });

  it('tidak merender area header kalau tidak ada judul maupun aksi', () => {
    const { container } = render(<SectionCard>Isi</SectionCard>);
    expect(container.querySelector('header')).toBeNull();
  });

  it('merender header kalau hanya ada aksi tanpa judul', () => {
    const { container } = render(<SectionCard actions={<button>Ekspor</button>}>Isi</SectionCard>);
    expect(container.querySelector('header')).not.toBeNull();
  });

  it('memakai border, bukan shadow — shadow hanya untuk overlay', () => {
    const { container } = render(<SectionCard>Isi</SectionCard>);
    const kelas = container.firstElementChild?.className ?? '';
    expect(kelas).toContain('border');
    expect(kelas).not.toContain('shadow');
  });

  it('tidak memakai gradient — band gradient adalah pola lama yang diganti', () => {
    const { container } = render(<SectionCard title="Judul">Isi</SectionCard>);
    expect(container.innerHTML).not.toContain('gradient');
  });
});
```

Buat `src/components/ui/EmptyState.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('menampilkan judul dan deskripsi', () => {
    render(
      <EmptyState
        icon={<svg data-testid="ikon" />}
        title="Belum ada transaksi"
        description="Tambahkan transaksi pertama."
      />,
    );
    expect(screen.getByText('Belum ada transaksi')).toBeTruthy();
    expect(screen.getByText('Tambahkan transaksi pertama.')).toBeTruthy();
  });

  it('menerima ikon sebagai elemen, bukan emoji', () => {
    render(<EmptyState icon={<svg data-testid="ikon" />} title="Kosong" />);
    expect(screen.getByTestId('ikon')).toBeTruthy();
  });

  it('menampilkan slot aksi kalau diberikan', () => {
    render(
      <EmptyState
        icon={<svg />}
        title="Kosong"
        action={<button>Tambah data</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Tambah data' })).toBeTruthy();
  });

  it('deskripsi boleh kosong', () => {
    render(<EmptyState icon={<svg />} title="Kosong" />);
    expect(screen.getByText('Kosong')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx vitest run src/components/ui/SectionCard.test.tsx src/components/ui/EmptyState.test.tsx`
Expected: FAIL — `Cannot find module './SectionCard'` dan `Cannot find module './EmptyState'`.

- [ ] **Step 3: Tulis `SectionCard`**

Buat `src/components/ui/SectionCard.tsx`:

```tsx
import type { ReactNode } from 'react';

type Props = {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Matikan untuk isi yang harus menyentuh tepi kartu, mis. tabel. */
  padding?: boolean;
  children: ReactNode;
};

/**
 * Kartu berjudul — pengganti band header gradient yang sekarang di-copy manual
 * di belasan tempat (AddTransaksiPage, PerformaLadiesPage, RekapVoucherPage,
 * ListPageToolbar), bahkan dengan arah gradient yang tidak konsisten antar
 * kartu bersebelahan.
 *
 * Tanpa shadow: struktur dibangun dari garis 1px. Shadow disimpan khusus untuk
 * elemen yang benar-benar melayang (dropdown, modal, sheet).
 */
const SectionCard = ({ title, subtitle, actions, padding = true, children }: Props) => (
  <div className="bg-surface border border-line rounded-lg overflow-hidden">
    {(title || actions) && (
      <header className="flex items-start justify-between gap-3 px-4 py-3 border-b border-line">
        <div className="min-w-0">
          {title && (
            <h2 className="text-base font-semibold text-fg truncate">{title}</h2>
          )}
          {subtitle && <p className="text-xs text-fg-faint mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </header>
    )}

    <div className={padding ? 'p-4' : ''}>{children}</div>
  </div>
);

export default SectionCard;
```

- [ ] **Step 4: Tulis `EmptyState`**

Buat `src/components/ui/EmptyState.tsx`:

```tsx
import type { ReactNode } from 'react';

type Props = {
  /** Ikon Feather (`react-icons/fi`), bukan emoji — emoji dirender berbeda di
      tiap sistem operasi dan terbaca informal. */
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

/** Keadaan kosong. Selalu sertakan `action` kalau memang ada yang bisa
    dilakukan pengguna — layar kosong tanpa jalan keluar itu jalan buntu. */
const EmptyState = ({ icon, title, description, action }: Props) => (
  <div className="flex flex-col items-center justify-center text-center px-6 py-12">
    <div
      className="flex items-center justify-center size-11 rounded-lg bg-subtle text-fg-faint mb-3 [&>svg]:size-5"
      aria-hidden="true"
    >
      {icon}
    </div>

    <h3 className="text-base font-semibold text-fg">{title}</h3>

    {description && (
      <p className="text-sm text-fg-muted mt-1 max-w-xs">{description}</p>
    )}

    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
```

- [ ] **Step 5: Jalankan test, pastikan lolos**

Run: `npx vitest run src/components/ui/SectionCard.test.tsx src/components/ui/EmptyState.test.tsx`
Expected: PASS — 10 test lolos (6 SectionCard + 4 EmptyState).

- [ ] **Step 6: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 4 warning · 145 test lolos.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/SectionCard.tsx src/components/ui/SectionCard.test.tsx src/components/ui/EmptyState.tsx src/components/ui/EmptyState.test.tsx
git commit -m "feat(ui): primitif SectionCard & EmptyState

SectionCard menggantikan band header gradient yang di-copy manual di
belasan tempat — di AddTransaksiPage arah gradientnya bahkan terbalik
antara dua kartu bersebelahan. Tanpa shadow: struktur dari garis 1px.

EmptyState memakai ikon Feather, bukan emoji 60px, dan punya slot aksi
supaya layar kosong tidak jadi jalan buntu.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Halaman pratinjau `/ui` dan penutup fase

Tanpa halaman ini, kedua tema tidak bisa diperiksa sampai Fase 2 — dan kalau ada token yang salah, kesalahannya baru ketahuan setelah terlanjur dipakai puluhan halaman. Halaman ini juga jadi panduan gaya hidup untuk fase-fase berikutnya.

Rute hanya didaftarkan saat `import.meta.env.DEV`, jadi **nol permukaan baru di produksi**.

**Files:**
- Create: `src/features/dev/pages/UiPreviewPage.tsx`
- Modify: `src/App.tsx` (tambah satu rute bersyarat)

**Interfaces:**
- Consumes: `Button`, `Badge`, `Money`, `SectionCard`, `EmptyState` (Task 4–6); `useTheme` dari `src/context/ThemeContext.tsx` (Fase 0); `petakanStatus`, `petakanKategori` dari `src/lib/statusMap.ts` (Task 3)
- Produces: rute `/ui` (khusus dev)

- [ ] **Step 1: Buat halaman pratinjau**

Buat `src/features/dev/pages/UiPreviewPage.tsx`:

```tsx
import { FiInbox, FiPlus, FiSearch } from 'react-icons/fi';

import { useTheme } from '../../../context/ThemeContext';
import { petakanKategori, petakanStatus } from '../../../lib/statusMap';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import Money from '../../../components/ui/Money';
import SectionCard from '../../../components/ui/SectionCard';

import type { ThemePreference } from '../../../lib/theme';

const PILIHAN_TEMA: { nilai: ThemePreference; label: string }[] = [
  { nilai: 'light', label: 'Terang' },
  { nilai: 'dark', label: 'Gelap' },
  { nilai: 'system', label: 'Ikut sistem' },
];

const STATUS_CONTOH = ['active', 'not active', 'resign', 'AKTIF', 'KERJA', 'SAKIT', 'entah'];
const KATEGORI_CONTOH = ['voucher', 'kasbon', 'dokter', 'pemasukan_lain', 'gaji_pengawas'];

/**
 * Panduan gaya hidup — bukan bagian aplikasi.
 *
 * Hanya terdaftar saat mode dev (lihat App.tsx), jadi tidak menambah
 * permukaan apa pun di produksi. Gunanya: melihat seluruh primitif di kedua
 * tema sekaligus, supaya token yang salah ketahuan sebelum dipakai puluhan
 * halaman.
 */
const UiPreviewPage = () => {
  const { preference, theme, setPreference } = useTheme();

  return (
    <div className="bg-canvas text-fg min-h-screen p-6 font-sans">
      <div className="mx-auto max-w-4xl flex flex-col gap-6">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Panduan Gaya</h1>
            <p className="text-sm text-fg-muted mt-0.5">
              Primitif Fase 1a. Tema aktif: <strong className="text-fg">{theme}</strong>
            </p>
          </div>

          <div className="flex gap-2">
            {PILIHAN_TEMA.map((opsi) => (
              <Button
                key={opsi.nilai}
                size="sm"
                variant={preference === opsi.nilai ? 'primary' : 'secondary'}
                onClick={() => setPreference(opsi.nilai)}
              >
                {opsi.label}
              </Button>
            ))}
          </div>
        </header>

        <SectionCard title="Button" subtitle="Empat varian, tiga ukuran, nol gradient">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary">Simpan</Button>
              <Button variant="secondary">Batal</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Hapus</Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="primary" icon={<FiPlus />}>
                Kecil
              </Button>
              <Button size="md" variant="primary" icon={<FiPlus />}>
                Sedang
              </Button>
              <Button size="lg" variant="primary" icon={<FiPlus />}>
                Besar
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" loading>
                Menyimpan
              </Button>
              <Button variant="primary" disabled>
                Nonaktif
              </Button>
              <Button variant="secondary" icon={<FiSearch />}>
                Dengan ikon
              </Button>
            </div>

            <p className="text-xs text-fg-faint">
              Tekan Tab untuk memeriksa cincin fokus — sebelumnya proyek ini tidak punya
              satu pun aturan <code>:focus-visible</code>.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Badge" subtitle="Nilai mentah diterjemahkan oleh statusMap">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {STATUS_CONTOH.map((mentah) => {
                const info = petakanStatus(mentah);
                return (
                  <Badge key={mentah} variant={info.varian}>
                    {info.label}
                  </Badge>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {KATEGORI_CONTOH.map((mentah) => {
                const info = petakanKategori(mentah);
                return (
                  <Badge key={mentah} variant={info.varian}>
                    {info.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Money" subtitle="Tabular, awalan Rp diredupkan">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline gap-5">
              <Money value={2700000} />
              <Money value={450000} arah="masuk" tampilkanTanda />
              <Money value={200000} arah="keluar" tampilkanTanda />
              <Money value={0} />
            </div>

            <div>
              <Money value={2700000} ukuran="display" />
            </div>

            <div className="border border-line rounded-lg overflow-hidden">
              {[2700000, 450000, 91800000, 1650000].map((n) => (
                <div
                  key={n}
                  className="flex items-center justify-between px-3 py-2 border-b border-line-subtle last:border-b-0"
                >
                  <span className="text-sm text-fg-muted">Baris contoh</span>
                  <Money value={n} ukuran="sm" />
                </div>
              ))}
            </div>

            <p className="text-xs text-fg-faint">
              Digit di kolom kanan harus sejajar sempurna antar baris. Kalau tidak,
              <code> tabular-nums</code> tidak aktif.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="EmptyState" padding={false}>
          <EmptyState
            icon={<FiInbox />}
            title="Belum ada transaksi"
            description="Transaksi yang dicatat bulan ini akan muncul di sini."
            action={
              <Button variant="primary" size="sm" icon={<FiPlus />}>
                Tambah transaksi
              </Button>
            }
          />
        </SectionCard>

        <SectionCard>
          <p className="text-sm text-fg-muted">
            Kartu tanpa judul — tidak merender area header sama sekali.
          </p>
        </SectionCard>
      </div>
    </div>
  );
};

export default UiPreviewPage;
```

- [ ] **Step 2: Daftarkan rute khusus dev di App.tsx**

Di `src/App.tsx`, tambahkan deklarasi lazy bersama deklarasi lazy lainnya (setelah baris `const HomePage = lazy(...)`):

```ts
/* Panduan gaya — khusus mode dev.

   Guard-nya membungkus `lazy()`, bukan cuma <Route>-nya. Kalau hanya JSX yang
   dijaga, `import()` tetap berdiri di level modul dan Rollup tetap membuat
   chunk-nya (terbukti: 8,8 KB ikut terkirim), cuma tidak pernah dipanggil.
   Dengan bentuk ternary ini `import.meta.env.DEV` diganti `false` saat build,
   cabangnya mati, dan chunk-nya tidak pernah lahir. */
const UiPreviewPage = import.meta.env.DEV
  ? lazy(() => import('./features/dev/pages/UiPreviewPage'))
  : null;
```

Lalu di dalam `<Routes>`, tepat **sebelum** baris `{/* 404 fallback */}`, tambahkan:

```tsx
            {UiPreviewPage && <Route path="/ui" element={<UiPreviewPage />} />}
```

- [ ] **Step 3: Periksa kedua tema di browser**

Run: `npm run dev`

Buka `http://localhost:5173/ui` dan periksa:

1. Tekan **Terang** dan **Gelap** bergantian — seluruh kartu, badge, dan teks harus ikut berubah, tanpa ada satu pun elemen yang tertinggal berwarna lama.
2. Di **kedua tema**, semua teks harus terbaca jelas. Perhatikan khusus badge `neutral` dan teks `text-fg-faint` — itu yang paling rawan kontrasnya kurang.
3. Tekan **Tab** berulang kali — setiap tombol harus menunjukkan cincin fokus yang jelas.
4. Di bagian Money, digit pada kolom kanan daftar harus **sejajar sempurna** antar baris.
5. Tombol **Menyimpan** harus terkunci dan menampilkan pemutar, dengan lebar yang sama seperti tombol normal.
6. Kecilkan jendela sampai selebar HP — tidak boleh ada scroll horizontal.

- [ ] **Step 4: Pastikan rute tidak ada di produksi**

Run: `npm run build`

**Jangan** memverifikasi dengan mencari string `"UiPreviewPage"` di dalam isi berkas — nama identifier hilang saat minifikasi, jadi pencarian itu mengembalikan nol walaupun kodenya sebenarnya ikut terkirim. Yang diperiksa adalah **ada tidaknya berkas chunk-nya**:

```powershell
Get-ChildItem dist/assets/*Ui*.js -ErrorAction SilentlyContinue
Select-String -Path "dist/assets/*.js" -Pattern "Panduan Gaya" -SimpleMatch -List
```

Expected: **keduanya tidak mengembalikan apa pun.** Kalau `UiPreviewPage-*.js` muncul, berarti guard-nya salah tempat — pastikan `import.meta.env.DEV` membungkus panggilan `lazy()`, bukan hanya elemen `<Route>`.

- [ ] **Step 5: Jalankan gate lengkap**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 4 warning · 145 test lolos.

- [ ] **Step 6: Jalankan checklist paritas fungsional**

Fase ini tidak menyentuh halaman aplikasi mana pun, jadi checklistnya ringkas — yang diperiksa adalah bahwa tidak ada yang bocor:

- [ ] `/` , `/ladies`, `/add-transaksi`, `/buku-kuning`, `/absensi` tampil persis seperti sebelum Fase 1a
- [ ] Login dan logout masih normal
- [ ] Tidak ada galat baru di console browser

- [ ] **Step 7: Commit**

```bash
git add src/features/dev/pages/UiPreviewPage.tsx src/App.tsx
git commit -m "feat(ui): halaman pratinjau /ui khusus mode dev

Tanpa ini kedua tema tidak bisa diperiksa sampai Fase 2, dan token yang
salah baru ketahuan setelah terlanjur dipakai puluhan halaman.

Rutenya dijaga import.meta.env.DEV sehingga tidak ikut ter-build ke
produksi — diverifikasi dengan mencari UiPreviewPage di bundel hasil build.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Setelah fase ini

Fase 1b melanjutkan dengan primitif interaktif yang butuh DOM lebih dalam:
`Field`/`Input` (satu primitif untuk semua tipe termasuk `date`), `Overlay` /
`Drawer` / `Sheet` berbasis Radix dengan focus trap dan Escape,
`SegmentedControl`, `Pagination`, dan `StatCard`. Semuanya ditambahkan ke
halaman `/ui` yang sama.

Baru setelah itu Fase 2 (shell) memasang primitif ini ke aplikasi sungguhan —
dan di situlah perubahan tampilan pertama kali terlihat pengguna.
