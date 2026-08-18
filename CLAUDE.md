# Web SR — panduan untuk kontributor & asisten AI

Aplikasi manajemen SR Agency: ladies, pengawas, absensi, dan transaksi
(voucher, kasbon, dokter, pemasukan lain). React 19 + Vite + Supabase.

Dokumen ini memuat aturan yang **tidak terbaca dari kode** — keputusan yang
sudah diambil beserta alasannya. Baca sebelum mengubah apa pun di area terkait.

---

## Aturan yang menyangkut uang

### Jangan pernah menghitung ulang nilai historis dari konstanta

Setiap transaksi voucher menyimpan sendiri angkanya saat dibuat: `jumlah`
(bagian ladies), `jumlah_voucher` (pcs), `untung`, dan `outlet`. Laporan
**wajib membaca kolom-kolom itu**, bukan menghitung ulang dari harga yang
berlaku sekarang.

Alasannya: harga voucher bisa berubah, dan berbeda per outlet/tier. Kalau
laporan menghitung ulang (mis. `jumlah / 150000`), mengubah harga akan
diam-diam mengubah angka transaksi bulan-bulan lalu — termasuk yang sudah
dipakai untuk bagi hasil.

Prinsip yang sama berlaku untuk `outlet`: baca kolom `outlet` yang tersimpan
di baris transaksi, bukan `ladies.nama_outlet` lewat join. Ladies bisa pindah
outlet, dan transaksi lamanya harus tetap tercatat di outlet yang lama.

Harga hanya boleh dibaca dari `outlet_pricing` **satu kali**, yaitu saat
transaksi baru dibuat di `TransaksiForm.tsx`.

### Kalau harga tidak diketahui, blokir — jangan menebak

`TransaksiForm` menolak menyimpan kalau tier harga belum termuat atau outlet
belum dikonfigurasi. Jangan pernah menggantinya dengan nilai default atau 0:
transaksi yang gagal tersimpan itu jelas terlihat, sedangkan transaksi dengan
nominal salah bisa berbulan-bulan tidak ketahuan.

### Fungsi perhitungan uang harus murni dan ada test-nya

Sudah diekstrak dari komponen dan diuji (`npm test`):

- `src/features/transaction/utils/saldoBerjalan.ts` — saldo berjalan Buku
  Kuning, dipakai bersama versi ladies & pengawas
- `src/features/transaction/utils/pilihTier.ts` — resolusi harga per
  outlet/tier

Kalau menambah perhitungan uang baru, ikuti pola yang sama: fungsi murni di
`utils/`, komponen hanya memanggil.

---

## Data & state

- **React Query** untuk semua data server. Cache 30 detik diatur di
  `src/lib/queryClient.ts`, dan error toast ditangani terpusat lewat
  `meta: { errorLabel: '...' }` — jangan pasang toast error sendiri per query.
- **Redux** HANYA untuk sesi user yang sedang login (`userSlice`). Jangan
  menambah thunk untuk fetch data di sana.
- Hook data yang sudah ada dan sebaiknya dipakai ulang:
  `useEntityList` (list admin: paginasi + cari + CRUD), `useLedgerData`
  (transaksi bulanan ladies), `useOutletPricing`, `useAgentOptions`,
  `useOutletOptions`.
- Selalu `select()` kolom yang benar-benar dipakai, jangan `select('*')`.
  **Verifikasi nama kolom ke Supabase dulu** — jangan menebak dari tipe
  TypeScript di frontend, karena tipe itu bisa tidak sinkron dengan skema
  sebenarnya. Contoh: tabel `vouchers` tidak punya kolom `keterangan`.

---

## UI

- Warna, radius, spasi, dan ukuran font berasal dari token di
  `src/styles/variable.css`. Jangan menulis hex literal di komponen.
  Nama token dipertahankan dari tema lama (`--color-green` sebenarnya biru),
  jadi ikuti nilainya, bukan namanya.
- Komponen bersama yang sudah ada: `DataTable`, `CardTable`, `ModalWrapper`,
  `FormField`, `Button`, `ActionIconButton`, `ListPageToolbar`,
  `TransaksiFilterBar`, `SearchableSelect`, `EmptyState`, `Pagination`.
- Gunakan `confirmDialog()` dari `components/ConfirmDialog`, bukan
  `window.confirm`.
- **Status memuat: skeleton untuk daftar & kartu, ikon berputar hanya di dalam
  tombol aksi.** Pakai `ListLoadingState` (daftar/tabel), `DetailFormSkeleton`
  (halaman Detail entitas), atau susun sendiri dari `Skeleton` kalau tata
  letaknya khas. Dua pengecualian yang sudah disepakati dan diberi komentar di
  kode: `RouteLoader` (halaman yang akan muncul belum diketahui) dan status
  "sedang mengambil pilihan" di samping dropdown pada halaman Add Transaksi.
- **Input di mobile minimal 16px.** Di bawah itu Safari iOS otomatis men-zoom
  halaman saat input difokus. Sudah ada aturan global di `global.css` untuk
  layar ≤768px, tapi inline style mengalahkan stylesheet — jadi kalau menulis
  `fontSize` inline pada input, pakai `isMobile ? 16 : ...`.
- Hindari memanggil `.focus()` secara programatik di mobile: iOS memindahkan
  fokus (halaman ikut ter-zoom) tapi menolak memunculkan keyboard kalau fokus
  terjadi di luar gesture user langsung.

---

## Deploy & rilis

- Hosting **Vercel**, build dari repo GitHub. Variabel build diambil dari
  `.env.production` yang **sengaja ikut ter-commit** — isinya hanya URL dan
  anon key Supabase yang toh sudah ter-inline ke bundle JS. Rahasia asli
  taruh di `.env.local` (diabaikan git).
- **Jangan pernah mencabut jalur lama sebelum jalur baru terbukti jalan di
  produksi.** Dua insiden di proyek ini berasal dari melanggar urutan ini:
  mengeluarkan `.env` dari repo sebelum variabelnya dipasang di Vercel, dan
  menyambungkan klien ke Edge Function sebelum fungsinya di-deploy.
- Sebelum commit: `npx tsc -b`, `npm run lint`, dan `npm test` harus bersih.

---

## Keamanan — kondisi saat ini

Beberapa lubang serius **masih terbuka** dan sedang dalam antrean perbaikan.
Jangan menganggap data di Supabase terlindungi:

- Verifikasi password masih berjalan di browser, sehingga kolom hash harus
  bisa dibaca publik. Edge Function penggantinya sudah ditulis di
  `supabase/functions/login/` tapi **belum di-deploy** — jangan sambungkan
  klien ke sana sebelum mengikuti urutan di README folder tersebut.
- Kebijakan RLS masih terbuka penuh untuk anon key.
- Belum ada otorisasi per-role di level rute; perbedaan peran hanya kosmetik
  (`MainLayout` memilih navbar berbeda).
- Identitas ladies diambil dari `localStorage` yang bisa diedit user.

Setiap fitur baru mewarisi kondisi ini. Jangan menambah asumsi bahwa data
sudah tersaring per user.
