-- D7 — Tabel penampung laporan error dari aplikasi.
--
-- Aman dijalankan kapan saja, termasuk setelah kodenya sudah rilis: selama
-- tabel ini belum ada, `reportError()` diam-diam melewati pengiriman dan
-- hanya menulis ke console. Begitu tabel dibuat, pelaporan langsung jalan
-- tanpa perlu deploy ulang.

create table if not exists error_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  pesan text not null,
  stack text,
  -- Dari mana error berasal: 'ErrorBoundary', 'query', 'window.onerror',
  -- atau 'unhandledrejection'.
  sumber text not null,
  detail text,
  halaman text,
  user_agent text,
  -- Sengaja TANPA foreign key ke users: laporan error harus tetap tersimpan
  -- meski user-nya kemudian dihapus, dan kegagalan menulis log tidak boleh
  -- menghalangi apa pun.
  user_id uuid
);

-- Query yang paling sering dipakai: "error terbaru", dan "error di halaman X".
create index if not exists error_logs_created_at_idx
  on error_logs (created_at desc);

alter table error_logs enable row level security;

-- Aplikasi hanya perlu MENULIS. Sengaja tidak ada policy SELECT untuk anon:
-- isi log bisa memuat potongan data internal, jadi bacanya lewat SQL Editor
-- atau dashboard Supabase saja.
create policy "Allow insert error_logs" on error_logs
  for insert with check (true);

-- Melihat error terbaru (jalankan di SQL Editor):
--   select created_at, sumber, halaman, pesan
--   from error_logs
--   order by created_at desc
--   limit 50;
--
-- Membersihkan log lama (mis. lebih dari 30 hari):
--   delete from error_logs where created_at < now() - interval '30 days';
