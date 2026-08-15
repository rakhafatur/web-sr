-- B4 — Cabut hak baca kolom `password` dari anon key.
--
-- JANGAN jalankan sebelum Edge Function `login` ter-deploy DAN aplikasi sudah
-- dirilis memakainya. Selama klien lama masih membaca kolom ini untuk
-- bcrypt.compare di browser, menjalankan skrip ini akan membuat semua orang
-- tidak bisa login.
--
-- Urutan yang benar:
--   1. Deploy Edge Function `login`
--   2. Uji via curl (lihat supabase/functions/login/README.md)
--   3. Rilis perubahan AuthContext.tsx, pastikan login jalan di produksi
--   4. Baru jalankan file ini
--
-- Efek: anon (pengunjung biasa lewat REST) tidak lagi bisa SELECT kolom
-- password. Edge Function tetap bisa karena memakai service role key.
-- INSERT dan UPDATE tidak disentuh, jadi pendaftaran user baru dan ganti
-- password lewat halaman Detail User tetap berfungsi.

revoke select on public.users from anon;

grant select (
  id,
  username,
  nama,
  is_active,
  user_group_id,
  ladies_id,
  pengawas_id,
  agent_id
) on public.users to anon;

-- Verifikasi setelah dijalankan — yang pertama harus DITOLAK, kedua BERHASIL:
--   GET /rest/v1/users?select=password&limit=1
--   GET /rest/v1/users?select=id,username,nama&limit=1
--
-- Untuk mengembalikan (kalau perlu rollback):
--   grant select on public.users to anon;
