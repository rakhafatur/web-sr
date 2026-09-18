# Redesign UI web-sr — spec desain

**Tanggal:** 18 September 2026
**Status:** disetujui, siap diturunkan jadi implementation plan
**Ruang lingkup:** tampilan saja. Nol perubahan business logic, nol perubahan autentikasi.

---

## 1. Kenapa

UI sekarang terbaca sebagai admin panel lama. Penyebabnya bukan selera warna, melainkan
lima hal yang terukur:

1. **Tidak ada tipografi.** `--font-base: 'Segoe UI', sans-serif` tanpa webfont. Segoe UI
   hanya ada di Windows; di Android/iOS/Mac huruf jatuh ke default sistem yang berbeda-beda.
   `RiwayatAbsensiPage.css` bahkan meminta `'Inter'` yang tidak pernah dimuat.
2. **Skala ada tapi diabaikan.** 6 token radius vs 17 nilai yang benar-benar dipakai;
   7 token ukuran font vs ±30 nilai literal (dari `fontSize: 8` sampai `60`); 488
   `style={{...}}` inline tersebar di 60 berkas.
3. **Gradient jadi dekorasi default.** 55 pemakaian `linear-gradient`. Ketika semua
   ditekankan, tidak ada yang tertekankan.
4. **Tidak ada dashboard.** Route `/` admin adalah halaman hero berisi foto dan tiga pill
   emoji — nol angka, untuk aplikasi yang mengelola bagi hasil.
5. **Responsif dikerjakan di JavaScript.** 29 berkas bercabang lewat `useMediaQuery`,
   sehingga desktop dan mobile jadi dua desain yang diam-diam berbeda.

Yang **sudah benar** dan dipertahankan: token semantik kategori transaksi, pola
`Skeleton` + `ListLoadingState`, `confirmDialog()`, hook data (`useEntityList`,
`useLedgerData`, dst), dan komentar "kenapa" di sepanjang kode.

---

## 2. Yang tidak boleh dilanggar

### 2.1 Paritas fungsional — nol fitur hilang

Ini syarat utama dari pemilik proyek. Setiap fase hanya boleh selesai kalau seluruh daftar
di bawah masih berfungsi. Daftar ini adalah checklist uji, bukan ringkasan.

**Autentikasi & sesi** — tidak disentuh sama sekali: login, signup, `SessionGuard`,
`ProtectedRoute`, `RootRoute`, splash screen, pemilihan shell berdasarkan role.

**CRUD admin** (Users, Approval User, Pengawas, Ladies, Agent, Outlet) — daftar, pencarian
berkata kunci, paginasi, tambah, detail/ubah, hapus dengan konfirmasi, dan konfigurasi
harga per outlet/tier.

**Transaksi Ladies** — pemilihan ladies, form transaksi dengan harga per tier, riwayat
transaksi dengan filter bar + pencarian + pengurutan kolom, Buku Kuning dengan saldo
berjalan, ekspor PDF, dan modal Generate Biaya Bulanan.

**Transaksi Pengawas** — form tambah, Buku Kuning pengawas, ekspor PDF.

**Absensi** — kalender, modal tambah, pemilih status, kartu rekap bulanan, hapus baris
lewat geser (`SwipeToDelete`).

**Laporan** — Rekap Voucher (rentang tanggal, pengelompokan per outlet, total, ekspor PDF)
dan Performa Ladies (grafik Recharts, pengalih mode, rentang tanggal).

**Smart Chat** — versi admin dan versi ladies.

**Ladies** — Home (estimasi pendapatan, tombol sembunyikan nominal, progres kehadiran,
rincian voucher/kasbon), empat buku (Voucher, Kasbon, Dokter, Pemasukan Lain) dengan
navigasi bulan dan paginasi, Riwayat Absensi, Peraturan, Profil.

**Lintas halaman** — lonceng notifikasi ladies (feed dari empat tabel, penanda "terakhir
dilihat" di localStorage), `PullToRefresh`, `OfflineBanner`, toast terpusat lewat
`meta: { errorLabel }`, `confirmDialog()`, PWA (`standalone`, `autoUpdate`, ikon, deep link).

**Berubah bentuk, tidak berubah fungsi** — perlu diverifikasi eksplisit:

| Sekarang | Jadi | Fungsi yang harus tetap ada |
|---|---|---|
| Menu grid 4 ikon di Home Ladies | Daftar aktivitas | Akses ke Voucher/Kasbon/Dokter/Absensi lewat bottom nav + "Lihat semua" |
| Bottom sheet admin berisi 15 rute | Halaman Menu | Keempatbelas rute + Smart Chat tetap terjangkau, ditambah pencarian |
| Halaman Detail/Create terpisah | Drawer di desktop | Rute tetap ada dan tetap bisa di-deep-link; mobile tetap halaman penuh |
| Animasi transisi rute | Dihapus | Tidak ada fungsi yang hilang — hanya jeda yang hilang |
| 5 komponen `*CardList` | `DataTable` responsif | Semua kolom yang sekarang tampil di mobile harus tetap tampil |
| 4 halaman buku ladies | Satu `LedgerPage` | Ikon, label, sumber tabel, dan ringkasan tiap buku tetap berbeda seperti sekarang |

### 2.2 Aturan uang

Tidak ada berkas di `src/features/transaction/utils/` dan `src/features/absensi/utils/`
yang boleh diubah, termasuk test-nya. `TransaksiForm` hanya berubah presentasinya:
resolusi tier harga dan penolakan menyimpan saat harga tidak diketahui tetap apa adanya.
Kalau ada fase yang memaksa menyentuh perhitungan uang, berhenti dan tanya dulu.

### 2.3 Urutan pencabutan

Bootstrap **tidak dicabut sampai halaman terakhir pindah** (Fase 7). Dua insiden di proyek
ini berasal dari mencabut jalur lama sebelum jalur baru terbukti di produksi.

---

## 3. Arah desain

Dua tema dari satu sistem token. Terang (**Daylight**) sebagai default, gelap
(**Midnight**) mengikuti `prefers-color-scheme` dan bisa ditimpa manual.

### 3.1 Arsitektur token

Tiga lapis. Komponen **hanya** boleh menyebut lapis semantik.

```
primitif  →  semantik  →  tema mengisi ulang semantik
(--gray-200)  (--border-default)   ([data-theme="dark"])
```

Konsekuensi yang harus ditegakkan: satu pun `#hex` atau warna inline di halaman akan
merusak tema gelap tanpa ketahuan. Ini ditegakkan lewat lint di Fase 7.

```css
:root {
  /* ===== Permukaan ===== */
  --bg-canvas:        #FFFFFF;
  --bg-surface:       #FCFCFD;
  --bg-subtle:        #F9FAFB;
  --bg-hover:         #F2F4F7;

  /* ===== Teks ===== */
  --text-primary:     #101828;
  --text-secondary:   #475467;
  --text-tertiary:    #98A2B3;
  --text-on-brand:    #FFFFFF;

  /* ===== Garis ===== */
  --border-subtle:    #F2F4F7;
  --border-default:   #EAECF0;
  --border-strong:    #D0D5DD;

  /* ===== Brand ===== */
  --brand-solid:      #4F46E5;
  --brand-solid-hover:#4338CA;
  --brand-subtle:     #EEF0FF;
  --brand-text:       #3730A3;
  --brand-ring:       rgb(79 70 229 / 0.14);

  /* ===== Uang ===== */
  --money-in:         #067647;
  --money-out:        #B42318;

  /* ===== Status ===== */
  --success-bg: #ECFDF3;  --success-border: #ABEFC6;  --success-text: #067647;
  --warning-bg: #FFFAEB;  --warning-border: #FEDF89;  --warning-text: #B54708;
  --danger-bg:  #FEF3F2;  --danger-border:  #FECDCA;  --danger-text:  #B42318;
  --danger-solid: #D92D20;
}

/* Hanya satu selektor, tanpa duplikasi nilai: script pra-paint di §3.2 selalu
   menuliskan data-theme konkret ("light" atau "dark") ke <html>, termasuk saat
   pilihan pengguna adalah "ikut sistem". CSS tidak perlu tahu soal
   prefers-color-scheme sama sekali. */
:root[data-theme="dark"] {
  color-scheme: dark;

  --bg-canvas:        #09090B;
  --bg-surface:       #101012;
  --bg-subtle:        #18181B;
  --bg-hover:         #1F1F23;

  --text-primary:     #FAFAFA;
  --text-secondary:   #A1A1AA;
  --text-tertiary:    #52525B;

  --border-subtle:    #131316;
  --border-default:   #1F1F23;
  --border-strong:    #27272A;

  --brand-solid:      #6D5CF0;
  --brand-solid-hover:#7C6FF5;
  --brand-subtle:     #1A1730;
  --brand-text:       #A79BFF;
  --brand-ring:       rgb(109 92 240 / 0.22);

  --money-in:         #4ADE80;
  --money-out:        #F87171;

  --success-bg: #0C1F16;  --success-border: #1B4430;  --success-text: #4ADE80;
  --warning-bg: #221A0B;  --warning-border: #453416;  --warning-text: #FBBF4D;
  --danger-bg:  #20110F;  --danger-border:  #4A1F1C;  --danger-text:  #F87171;
  --danger-solid: #E5484D;
}
```

Warna kategori transaksi (voucher/kasbon/dokter/pemasukan lain) dipertahankan karena
maknanya sudah dikenal pengguna, tapi di-remap ke ramp baru dan diberi varian per tema.

**Aksen brand hanya muncul di dua tempat:** aksi utama dan item navigasi aktif. Tidak di
kartu, tidak di header halaman, tidak di badge.

### 3.2 Pemilihan tema

Pilihan pengguna ada tiga: `light`, `dark`, `system` — disimpan di `localStorage`.
**Yang ditulis ke `<html data-theme>` selalu nilai konkret** (`light` atau `dark`); saat
pilihannya `system`, script yang menyelesaikan `prefers-color-scheme` jadi nilai konkret
dan memasang listener `matchMedia` supaya ikut berubah kalau preferensi sistem berubah
saat aplikasi terbuka. Ini yang membuat CSS di §3.1 cukup satu selektor tanpa duplikasi.

- Script itu berjalan di `index.html` **sebelum paint** supaya tidak ada kedip. Pola
  anti-blink yang sudah ada di sana tinggal diperluas.
- `<meta name="theme-color">` ikut berganti saat tema berganti.
- `vite.config.ts` → manifest PWA: `background_color` dan `theme_color` sekarang
  `#0e0e10` (gelap). Harus jadi `#FFFFFF` karena default baru adalah terang.
- Pengalih tema: kaki sidebar (desktop) dan halaman Profil (mobile).

### 3.3 Tipografi

**Inter Variable, di-bundle lokal** lewat `@fontsource-variable/inter` — bukan CDN Google
Fonts, karena aplikasi ini PWA dan harus jalan offline tanpa request eksternal.

| Token | Ukuran / tinggi baris | Dipakai untuk |
|---|---|---|
| `--text-xs` | 12 / 16 | Label tabel, meta, caption (uppercase, tracking +0.06em) |
| `--text-sm` | 13 / 18 | Teks sekunder, sel tabel |
| `--text-base` | 14 / 20 | Body default |
| `--text-md` | 16 / 24 | **Wajib** untuk input di mobile (anti auto-zoom iOS) |
| `--text-lg` | 18 / 26 | Judul kartu/section |
| `--text-xl` | 20 / 28 | Judul halaman (tracking −0.021em) |
| `--text-3xl` | 30 / 36 | Nilai KPI (tracking −0.03em) |
| `--text-display` | 36 / 40 | Nominal utama Home Ladies (tracking −0.035em) |

Bobot **hanya** 400 / 450 / 500 / 600. Bobot 700 dan 800 dihapus dari seluruh aplikasi —
itu penyebab utama tampilan sekarang terasa berteriak.

**Tidak ada ukuran di bawah 12px.** Ini menghapus `fontSize: 8/8.5/9/9.5/10/11` yang
sekarang dipakai untuk angka rupiah di `BukuKuningPengawasPage`, `LedgerCardRowV2`,
`CardTableRiwayatTransaksi`, dan `CardTableAbsensi`.

Semua angka uang memakai `font-variant-numeric: tabular-nums` supaya digit sejajar antar
baris.

### 3.4 Spasi, radius, elevasi

- **Spasi** — basis 4px. Gutter halaman 16 (mobile) / 24 (tablet) / 32 (desktop).
  Tinggi baris tabel 44px. Target sentuh minimum 44px di mobile.
- **Radius** — lima nilai: `sm 6`, `md 8`, `lg 12`, `xl 16`, `full`. Tombol & input `md`,
  kartu `lg`, modal & bottom sheet `xl`, badge & avatar `full`. Tidak ada angka lain.
- **Elevasi** — **kartu, tabel, dan panel tidak punya shadow sama sekali**; struktur
  dibangun dari garis 1px. Shadow hanya untuk yang benar-benar melayang: dropdown,
  popover, modal, toast, bottom sheet. Dua level saja (`overlay`, `modal`).

### 3.5 Motion

Animasi transisi antar rute dihapus — menambah jeda terasa di setiap navigasi tanpa
memberi informasi. Yang tersisa: press-scale, slide drawer/sheet, dan toast; semuanya
120–200ms, ease-out, dan **mati total** di `prefers-reduced-motion` (sekarang tidak ada
sama sekali di proyek ini).

---

## 4. Layout & navigasi

### Desktop

- Topbar 68px **dihapus**. Judul halaman pindah ke konten; menu akun, notifikasi, dan
  pengalih tema turun ke kaki sidebar.
- Sidebar 240px, bisa diciutkan ke rail 56px, state disimpan.
- **Accordion diganti grup berlabel small-caps dengan semua item terlihat.** Ini sekaligus
  memperbaiki bug: `showParameter`/`showTransaksiLadies`/`showTransaksiPengawas` default
  tertutup dan tidak pernah disinkronkan ke `location.pathname`, sehingga di halaman dalam
  sidebar tidak menunjukkan posisi pengguna sama sekali.
- Grup: **Operasional** (Ladies, Pengawas, Absensi) · **Keuangan** (Buku Kuning, Buku
  Kuning Pengawas, Rekap Voucher, Performa) · **Transaksi** (Add Transaksi, Add Transaksi
  Pengawas) · **Master Data** (Users, Approval, Agent, Outlet) · **Lain** (Smart Chat).
- **Command palette (⌘K)** — melompat ke halaman *dan* ke ladies tertentu berdasarkan nama.
- Ladies di desktop: `MainLayout` sekarang menampilkan teks *"Sidebar khusus ladies belum
  tersedia"*. Diganti sidebar ladies sungguhan dengan rute yang sama seperti bottom nav.
- Create/Edit membuka **drawer kanan 520px** supaya konteks daftar tidak hilang. Rutenya
  tetap ada agar bisa di-deep-link.

### Mobile

- Header branding 52–64px diganti **app bar per-halaman 48px**: tombol kembali (bila
  bersarang) + judul halaman + satu aksi. Logo tidak perlu diulang di PWA terpasang.
- Bottom nav 4 item + `env(safe-area-inset-bottom)`.
  Ladies: Home / Riwayat / Absensi / Profil. Admin: Home / Transaksi / Laporan / Menu.
- Bottom sheet admin berisi 15 rute diganti **halaman Menu sungguhan** yang bisa di-scroll,
  dikelompokkan, dan dicari. Sheet untuk aksi, bukan navigasi.
- Create/Edit tetap rute penuh — deep link PWA membutuhkannya.
- `MainLayout` sekarang memasang `minHeight: 100vh` pada `<main>` yang berada di bawah
  header sticky 68px, sehingga halaman selalu ≥100vh+68px dan scrollbar vertikal selalu
  muncul. Diperbaiki saat shell ditulis ulang.

### Home admin

Halaman hero berisi foto dan pill emoji diganti dashboard ringkas: KPI periode berjalan
(voucher, nilai voucher, kehadiran, kasbon), aktivitas terakhir, dan pintasan ke tiga
alur yang paling sering dipakai. Semua angka dibaca dari kolom transaksi yang tersimpan,
bukan dihitung ulang dari harga yang berlaku sekarang.

---

## 5. Strategi komponen

### 5.1 Dipertahankan (hanya ganti token)

`Skeleton`, `ListLoadingState`, `DetailFormSkeleton`, `PullToRefresh`, `SwipeToDelete`,
`confirmDialog()`, `ErrorBoundary`, `OfflineBanner`, `Avatar`, `NotificationBell`
(pindah tempat, logika tetap), seluruh hook data, seluruh `utils/`.

### 5.2 Digabung

| Sekarang | Jadi |
|---|---|
| `ListPageHeader` + `EntityPageHeader` + `FeaturePageHeader` | `PageHeader` |
| `DataTable` + `LadiesCardList` + `UserCardList` + `PengawasCardList` + `AgentCardList` + `UserApprovalCardList` | `DataTable` responsif |
| `AbsensiSummaryCards` + `LedgerSummaryCard` + stat inline (RekapVoucher, PerformaLadies) | `StatCard` / `StatGroup` |
| `.segmented-chip` + pill inline (AddTransaksi, PerformaLadies) + `StatusPicker` | `SegmentedControl` |
| `ModalWrapper` + bottom sheet di kedua BottomNavbar | `Overlay` (modal / drawer / sheet) |
| `VoucherListPage` + `KasbonListPage` + `DokterListPage` + `PemasukanLainListPage` | `LedgerPage` + konfigurasi |
| `HomePage` + `HomePageDesktop` + `HomePageMobile` | `HomePage` |
| `BottomNavbarAdmin` + `BottomNavbarLadies` | `BottomNav` + `MenuPage` |
| `EntityFormCard`, `EntitySubmitButton`, `EntityDetailActions`, `ModalHeading`, `HeaderActionButton`, `LedgerEmptyState` | diserap `SectionCard` / `Button` / `PageHeader` / `EmptyState` |

### 5.3 Diperbaiki

- **`Button`** — buang gradient dan colored shadow; varian `primary`/`secondary`/`ghost`/
  `danger`, ukuran 32/36/44, state loading yang mengunci lebar.
- **`FormField`** → `Field` + satu primitif input untuk semua tipe **termasuk `date`**.
  Ini menghapus tiga gaya input yang sekarang berbeda: `.form-input-sr` (radius 12,
  border abu), `dateInputStyle` (radius 6, tinggi 40, border biru), dan input rentang
  tanggal di RekapVoucher/PerformaLadies (radius 16, tinggi 56, border 2px).
  Font 16px di mobile datang dari token, bukan ternary `isMobile ?` per komponen.
- **`StatusBadge`** → `Badge` + **`statusMap.ts` terpusat**. Pemetaan status sekarang
  berupa `switch` yang diulang per halaman.
- **`SearchableSelect`** (411 baris, 19 inline style) — logika pencarian dipertahankan,
  presentasi pindah ke Radix Popover.
- **`Sidebar`** — grup berlabel, rail mode, state disimpan.
- **`Header`** — dibubarkan.
- **`EmptyState`** — emoji diganti ikon Feather, tambah slot aksi.
- **`Pagination`** — tambah "Menampilkan 1–10 dari 47" dan pengatur jumlah baris.
- **`DataTable`** — header sticky small-caps dengan `scope="col"`, pembatas hairline,
  hover baris, uang rata kanan tabular, caret sort selalu terlihat, dan **pengempisan ke
  baris bertumpuk di mobile lewat CSS** (bukan komponen terpisah).

### 5.4 Baru

`AppShell`, `SectionCard`, `Toolbar`, `Drawer`, `CommandPalette`, `ThemeProvider` +
`ThemeToggle`, `MenuPage`, `statusMap.ts`, dan **`Money`** — satu komponen untuk semua
nominal (tabular, "Rp" diredupkan, tanda +/− semantik). `Money` penting bukan karena
estetika: format rupiah sekarang ditulis ulang di belasan halaman.

### 5.5 Dipecah

`AbsensiPage` (933 baris) dan `RekapVoucherPage` (905 baris) dipecah jadi page + toolbar +
section. `RekapVoucherPage` sekalian dipindah ke React Query — sekarang memakai `useState`
+ supabase langsung, yang membuat status loading/error-nya berbeda sendiri dari halaman lain.

**Neto: ±20 berkas dihapus atau digabung, ±14 primitif baru.**

---

## 6. Aksesibilitas — batas minimum

Semua temuan di bawah sekarang **belum ada sama sekali** di proyek dan menjadi bagian
definisi selesai:

- `:focus-visible` menyeluruh — sekarang nol aturan, sementara banyak tombol kustom
  memakai `border: none` inline sehingga cincin fokus hilang total.
- `role="dialog"`, `aria-modal`, focus trap, Escape, dan scroll lock pada seluruh overlay.
  `ModalWrapper` sekarang tidak punya satupun; bottom sheet sudah punya sebagian.
- `scope="col"` pada header tabel.
- `prefers-reduced-motion`.
- Status tidak pernah disampaikan lewat warna saja — selalu ada label atau tanda (+/−).
- Kontras teks minimum 4.5:1 di kedua tema; token di atas sudah dipilih untuk itu dan
  diverifikasi ulang per fase.

---

## 7. Stack

- **Tailwind v4** (`@theme`, CSS-first) — memetakan langsung ke lapisan token.
- **Radix UI** untuk Dialog, Popover, DropdownMenu, Select, Tooltip — a11y didapat gratis
  dan menutup lubang di §6.
- **`@fontsource-variable/inter`** — lokal, offline-safe.
- **`react-icons/fi`** tetap satu-satunya set ikon. **Seluruh emoji di UI dihapus.**
- **Bootstrap dicabut di Fase 7**, setelah halaman terakhir pindah.

---

## 8. Roadmap

**Setiap fase adalah satu implementation plan tersendiri.** Delapan fase di bawah terlalu
besar untuk satu rencana; yang disusun lebih dulu hanya Fase 0, dan fase berikutnya baru
direncanakan setelah fase sebelumnya terbukti di produksi — karena apa yang dipelajari di
fase awal akan mengubah detail fase berikutnya.

Setiap fase diakhiri `npx tsc -b` + `npm run lint` + `npm test` bersih, lalu **deploy dan
verifikasi di produksi** sebelum fase berikutnya dimulai. Checklist §2.1 dijalankan ulang
di akhir setiap fase.

| # | Fase | Isi | Dampak terlihat |
|---|---|---|---|
| 0 | **Fondasi** | Tailwind berdampingan dengan Bootstrap, lapisan token + dua tema, `ThemeProvider`, script anti-kedip, Inter Variable lokal, manifest PWA | **Nol** — itu gate-nya |
| 1 | **Primitif** | `Button`, `Field`/`Input`, `Badge`, `SectionCard`, `Overlay`/`Drawer`/`Sheet`, `Money`, `EmptyState`, `Pagination`, `SegmentedControl`, `StatCard`, `statusMap` | Kecil — baru dipasang di satu halaman uji |
| 2 | **Shell** | `AppShell`, sidebar baru (+ sidebar ladies), app bar mobile, `BottomNav`, `MenuPage`, `CommandPalette`; `Header` dan animasi rute dihapus | **Terbesar** — shell kelihatan di 100% layar |
| 3 | **Ladies (mobile)** | `HomeLadies`, `LedgerPage` tunggal (4→1), `RiwayatAbsensi`, `Profil`, `Peraturan` | Besar — layar prioritas tertinggi |
| 4 | **Daftar admin** | `DataTable` responsif + `PageHeader` + `Toolbar`, lalu 6 halaman list. 5 `*CardList` dan 3 header dihapus | Besar — judul ganda hilang |
| 5 | **Transaksi & laporan** | AddTransaksi ×2, BukuKuning ×2, RekapVoucher, PerformaLadies, Absensi. Termasuk pemecahan dua halaman 900-baris | Sedang-besar, **paling berat** |
| 6 | **Form & detail entitas** | Create/Detail Ladies, Pengawas, Agent, User; drawer desktop | Sedang |
| 7 | **Sisa & pencabutan** | SmartChat, Login/SignUp, 404, Splash, Home admin. **Bootstrap dicabut.** Audit akhir | Kecil visual, besar untuk kebersihan |

Fase 3 mendahului Fase 4 karena mobile adalah prioritas pemilik proyek, tapi tidak bisa
lebih awal: Home Ladies membutuhkan `Money`, `StatCard`, dan shell mobile baru.

---

## 9. Risiko

| Risiko | Penanganan |
|---|---|
| Fitur hilang diam-diam saat halaman ditulis ulang | Checklist §2.1 dijalankan di akhir setiap fase, bukan di akhir proyek |
| Angka uang berubah karena refactor | `utils/` dan test-nya tidak disentuh; `TransaksiForm` hanya berubah presentasi |
| Dua tema jadi dua kali kerja | Komponen hanya menyebut token semantik; ditegakkan lint di Fase 7 |
| Bootstrap dicabut terlalu cepat | Pencabutan dikunci di Fase 7 |
| Halaman setengah-migrasi terlihat campur | Migrasi per rute penuh, bukan per komponen lintas halaman |
| `RekapVoucherPage` pindah ke React Query mengubah perilaku | Dikerjakan sebagai langkah terpisah di Fase 5 dengan verifikasi angka sebelum/sesudah |

---

## 10. Di luar ruang lingkup

- Autentikasi, verifikasi password, Edge Function login.
- Kebijakan RLS dan otorisasi per-role. Lubang keamanan yang tercatat di `CLAUDE.md`
  tetap terbuka setelah redesign ini dan tidak boleh dianggap tertutup.
- Skema database, nama kolom, dan seluruh perhitungan uang.
- Fitur baru. Redesign ini tidak menambah kemampuan apa pun.
