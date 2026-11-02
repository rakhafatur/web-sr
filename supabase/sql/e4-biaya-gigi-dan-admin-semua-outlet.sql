-- E4 — Biaya bulanan: tambah Gigi, dan outlet lain ikut generate (Admin saja).
--
--   Royal, SA      : Admin 500.000 + Spekulo 185.000 + Gigi 50.000
--   Outlet lainnya : Admin 500.000 saja
--
-- Di kolom dokter_spekulo & dokter_gigi, KOSONG (null) berarti outlet itu tidak
-- dikenakan biaya tersebut. kasbon_admin wajib terisi; kalau kosong, generate
-- ditolak.
--
-- URUTAN RILIS — kebalikan dari E3: deploy kode DULU, baru jalankan file ini.
-- Kode lama membaca Spekulo kosong sebagai 0 dan menolak seluruh generate,
-- sehingga menjalankan SQL ini lebih dulu akan membuat generate gagal untuk
-- semua outlet sampai kode baru terpasang. Sebaliknya aman: selama kolom
-- dokter_gigi belum ada, kode baru memakai perilaku lama (Royal/SA tanpa Gigi).

alter table outlets add column if not exists dokter_gigi numeric;

update outlets
set dokter_gigi = 50000
where nama_outlet in ('Royal', 'SA');

update outlets
set
  kena_biaya_bulanan = true,
  kasbon_admin = 500000,
  dokter_spekulo = null,
  dokter_gigi = null
where nama_outlet not in ('Royal', 'SA');

-- Outlet baru dari halaman Kelola Outlet otomatis ikut generate (Admin saja).
alter table outlets alter column kena_biaya_bulanan set default true;
alter table outlets alter column kasbon_admin set default 500000;

-- Memeriksa konfigurasi yang berlaku:
--   select nama_outlet, kena_biaya_bulanan, kasbon_admin, dokter_spekulo, dokter_gigi
--   from outlets order by nama_outlet;
