-- E1 — Kolom `keterangan` di tabel vouchers.
--
-- Tujuan: transaksi voucher di outlet yang punya lebih dari satu tipe harga
-- (mis. Travel: Single & Double) tercatat sebagai "Voucher - Single" /
-- "Voucher - Double", supaya tidak membingungkan saat rekapan (Buku Kuning,
-- PDF, riwayat). Outlet tanpa tier tetap "Voucher".
--
-- Urutan yang benar (CLAUDE.md: jangan sambungkan klien sebelum jalur baru
-- ada di produksi):
--   1. Jalankan file ini di Supabase SQL Editor
--   2. Verifikasi (lihat bawah) — harus mengembalikan [] tanpa error
--   3. Baru rilis perubahan aplikasi yang mengisi kolom ini saat insert
-- Kalau langkah 3 dirilis sebelum langkah 1, menyimpan voucher akan GAGAL
-- ("column vouchers.keterangan does not exist").
--
-- Aman untuk data lama: kolom boleh kosong (null); transaksi lama tetap
-- tampil sebagai "Voucher". Angka (jumlah, untung, dst.) tidak disentuh.

alter table public.vouchers
  add column if not exists keterangan text;

-- Verifikasi setelah dijalankan (harus [] tanpa error):
--   GET /rest/v1/vouchers?select=keterangan&limit=0
--
-- Rollback (kalau perlu, SETELAH aplikasi yang mengisinya ditarik):
--   alter table public.vouchers drop column if exists keterangan;
