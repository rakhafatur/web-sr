-- E2 — Tabel saklar menu aktif/nonaktif (halaman Pengaturan → Menu aplikasi).
--
-- Satu baris per menu yang pernah diubah admin. `kunci` = peran + id halaman
-- dari src/layout/menu.tsx, mis. 'admin.absensi' atau 'ladies.kasbon'.
-- Menu yang tidak punya baris dianggap AKTIF.
--
-- Aman dijalankan kapan saja, termasuk setelah kodenya sudah rilis: selama
-- tabel ini belum ada, aplikasi menampilkan semua menu seperti biasa dan
-- bagian "Menu aplikasi" di Pengaturan memberi tahu bahwa tabelnya belum
-- dibuat. Begitu tabel dibuat, saklar langsung bisa dipakai tanpa deploy.
--
-- PENTING — ini pengaturan TAMPILAN, bukan pengaman: selama RLS masih
-- terbuka untuk anon key (lihat CLAUDE.md "Keamanan"), siapa pun yang
-- memegang anon key bisa mengubah tabel ini atau membuka rute langsung.
-- Perketat policy di bawah setelah login lewat Edge Function berjalan.

create table if not exists pengaturan_menu (
  kunci text primary key,
  aktif boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table pengaturan_menu enable row level security;

create policy "Allow read pengaturan_menu" on pengaturan_menu
  for select using (true);

create policy "Allow insert pengaturan_menu" on pengaturan_menu
  for insert with check (true);

create policy "Allow update pengaturan_menu" on pengaturan_menu
  for update using (true) with check (true);

-- Verifikasi setelah dijalankan (harus [] tanpa error):
--   GET /rest/v1/pengaturan_menu?select=kunci,aktif&limit=0
--
-- Menyalakan kembali semua menu (darurat):
--   update pengaturan_menu set aktif = true, updated_at = now();
--
-- Rollback (aplikasi kembali menampilkan semua menu):
--   drop table if exists pengaturan_menu;
