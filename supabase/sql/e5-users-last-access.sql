-- E5 — Kolom "terakhir akses" user (halaman Users admin).
--
-- Diisi oleh SessionGuard di frontend: saat app dibuka / kembali difokus,
-- dan tiap 5 menit selama layar terbuka. Ketelitiannya ±5 menit dan memakai
-- jam device user. User yang belum membuka app sejak kolom ini dibuat
-- tampil "Belum tercatat".
--
-- Aman dijalankan kapan saja, termasuk setelah kodenya rilis: selama kolom
-- ini belum ada, daftar & detail user tetap tampil (tanpa info akses) dan
-- pencatatan gagal diam-diam. Begitu kolom dibuat, pencatatan langsung
-- jalan tanpa deploy ulang.
--
-- Tidak perlu policy baru — tabel users masih memakai policy terbuka yang
-- sama (lihat CLAUDE.md "Keamanan"), dan kolom ini ikut aturan itu.

alter table users add column if not exists last_access_at timestamptz;

-- Verifikasi setelah dijalankan (harus [] tanpa error):
--   GET /rest/v1/users?select=id,last_access_at&limit=0
--
-- Rollback (aman — frontend kembali ke tampilan tanpa info akses):
--   alter table users drop column if exists last_access_at;
