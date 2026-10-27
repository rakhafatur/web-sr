-- E3 — Tabel pemasukan lain pengawas (selain gaji: bonus, uang makan, dll.).
--
-- Sebelumnya form Transaksi Pengawas punya pilihan "Lainnya" yang menulis ke
-- tabel `lainnya_pengawas` — tabel itu tidak pernah ada, jadi setiap
-- penyimpanan gagal dan tidak ada data yang hilang. Pilihan itu diganti
-- "Pemasukan Lain" yang menulis ke tabel ini, dan dihitung sebagai
-- PEMASUKAN (+) di Buku Kuning Pengawas.
--
-- URUTAN RILIS (lihat CLAUDE.md, "Deploy & rilis"): jalankan file ini di
-- SQL Editor DULU, verifikasi, baru kode yang membacanya di-deploy. Buku
-- Kuning Pengawas sengaja gagal (bukan diam-diam menganggap 0) kalau tabel
-- ini belum ada, supaya saldo tidak pernah salah tanpa ketahuan.
--
-- Kolom sama dengan gaji_pengawas / kasbon_pengawas.

create table if not exists pemasukan_lain_pengawas (
  id uuid primary key default gen_random_uuid(),
  pengawas_id uuid not null references pengawas (id),
  tanggal date not null,
  jumlah numeric not null check (jumlah >= 0),
  keterangan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pemasukan_lain_pengawas_pengawas_tanggal_idx
  on pemasukan_lain_pengawas (pengawas_id, tanggal);

-- PENTING — policy di bawah terbuka penuh untuk anon key, SAMA dengan tabel
-- transaksi lain saat ini (lihat CLAUDE.md "Keamanan"). Perketat bersama
-- tabel lain setelah login lewat Edge Function berjalan.
alter table pemasukan_lain_pengawas enable row level security;

create policy "Allow read pemasukan_lain_pengawas" on pemasukan_lain_pengawas
  for select using (true);

create policy "Allow insert pemasukan_lain_pengawas" on pemasukan_lain_pengawas
  for insert with check (true);

create policy "Allow update pemasukan_lain_pengawas" on pemasukan_lain_pengawas
  for update using (true) with check (true);

create policy "Allow delete pemasukan_lain_pengawas" on pemasukan_lain_pengawas
  for delete using (true);

-- Verifikasi setelah dijalankan (harus [] tanpa error):
--   GET /rest/v1/pemasukan_lain_pengawas?select=id,pengawas_id,tanggal,jumlah,keterangan&limit=0
--
-- Rollback (HANYA sebelum ada data yang dicatat, dan setelah kode yang
-- membacanya ditarik — kalau tidak, Buku Kuning Pengawas akan gagal dimuat):
--   drop table if exists pemasukan_lain_pengawas;
