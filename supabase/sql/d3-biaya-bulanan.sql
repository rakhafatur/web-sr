-- D3 — Pindahkan konfigurasi biaya bulanan dari kode ke database.
--
-- Sebelumnya daftar outlet dan nominalnya di-hardcode di
-- src/features/transaction/utils/biayaBulanan.ts:
--   BIAYA_BULANAN_OUTLETS = ['Royal', 'SA', 'MTR']
--   KASBON_ADMIN_JUMLAH   = 500000
--   DOKTER_SPEKULO_JUMLAH = 185000
--
-- Dua masalahnya: outlet baru yang dibuat lewat halaman Kelola Outlet tidak
-- akan pernah ikut proses biaya bulanan tanpa ubah kode, dan 'MTR' tidak ada
-- di tabel `outlets` sehingga tidak pernah cocok dengan apa pun.
--
-- Aman dijalankan kapan saja: selama kolom ini belum ada, aplikasi memakai
-- nilai lama sebagai cadangan. Begitu dijalankan, konfigurasi dari sinilah
-- yang dipakai — tanpa perlu deploy ulang.

alter table outlets add column if not exists kena_biaya_bulanan boolean not null default false;
alter table outlets add column if not exists kasbon_admin numeric;
alter table outlets add column if not exists dokter_spekulo numeric;

-- Samakan dengan perilaku yang berlaku sekarang. 'MTR' sengaja TIDAK
-- disertakan karena outlet itu memang tidak ada di tabel ini — selama ini
-- entri tersebut tidak pernah berpengaruh apa pun.
update outlets
set
  kena_biaya_bulanan = true,
  kasbon_admin = 500000,
  dokter_spekulo = 185000
where nama_outlet in ('Royal', 'SA');

-- Setelah ini, mengubah nominal atau menambah/mengeluarkan outlet dari proses
-- biaya bulanan cukup lewat SQL — tidak perlu ubah kode:
--
--   update outlets set kasbon_admin = 550000 where nama_outlet = 'Royal';
--   update outlets set kena_biaya_bulanan = true, kasbon_admin = 500000,
--     dokter_spekulo = 185000 where nama_outlet = 'Travel';
--
-- Memeriksa konfigurasi yang berlaku:
--   select nama_outlet, kena_biaya_bulanan, kasbon_admin, dokter_spekulo
--   from outlets order by nama_outlet;
