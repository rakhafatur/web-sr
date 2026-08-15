# Edge Function `login`

Memverifikasi password di server, menggantikan `bcrypt.compare` yang sebelumnya
berjalan di browser. Hash bcrypt tidak pernah lagi dikirim ke klien.

## Urutan rilis — jangan dibolak-balik

Setiap langkah punya titik aman. Selama langkah 4 belum dijalankan, jalur lama
masih bisa dipulihkan hanya dengan revert commit di sisi aplikasi.

### 1. Deploy Edge Function

Supabase CLI belum dipakai di project ini, jadi lewat dashboard:

1. Buka **Supabase Dashboard → Edge Functions → Deploy a new function**
2. Nama fungsi: **`login`** (harus persis, dipanggil sebagai `invoke('login')`)
3. Salin seluruh isi `index.ts` di folder ini ke editor, lalu Deploy

Tidak perlu mengatur secret apa pun: `SUPABASE_URL` dan
`SUPABASE_SERVICE_ROLE_KEY` otomatis tersedia di Edge Function.

Pada tahap ini **aplikasi belum memanggilnya** — tidak ada yang berubah bagi user.

### 2. Uji dengan curl sebelum aplikasi diubah

Ganti `<ANON_KEY>` dengan anon key project (ada di `.env.production`).

```bash
# password BENAR  -> {"result":"success","user":{...}}   (tanpa field password)
curl -s -X POST "https://tghornkqkmmoblqhnvxk.supabase.co/functions/v1/login" \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"username":"USERNAME_UJI","password":"PASSWORD_BENAR"}'

# password SALAH  -> {"result":"invalid"}
curl -s -X POST "https://tghornkqkmmoblqhnvxk.supabase.co/functions/v1/login" \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"username":"USERNAME_UJI","password":"salah-banget"}'

# username TIDAK ADA -> {"result":"invalid"}   (pesan sama, disengaja)
curl -s -X POST "https://tghornkqkmmoblqhnvxk.supabase.co/functions/v1/login" \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"username":"tidak-ada-user-ini","password":"apa-saja"}'
```

Yang wajib dicek pada respons sukses: **tidak ada field `password`** di dalam `user`.

Kalau ketiganya sudah benar, lanjut. Kalau belum, berhenti di sini — aplikasi
masih utuh memakai jalur lama.

### 3. Rilis perubahan aplikasi

Deploy perubahan `src/context/AuthContext.tsx`. Setelah live, verifikasi di
produksi:

- Login sebagai admin → diarahkan ke `/`
- Login sebagai ladies → diarahkan ke `/ladies/home`
- Refresh halaman → masih login (sesi bertahan)
- Login dengan password salah → "Username atau password salah."
- Logout → kembali ke halaman login

User yang sebelumnya sudah login **tidak perlu login ulang** — bentuk sesi di
`localStorage` tidak berubah.

### 4. Tutup kolom password (B4)

Baru setelah langkah 3 terbukti aman, jalankan `supabase/sql/b4-revoke-password.sql`
di **SQL Editor**. Setelah itu verifikasi:

```bash
# harus DITOLAK sekarang
curl -s "https://tghornkqkmmoblqhnvxk.supabase.co/rest/v1/users?select=password&limit=1" \
  -H "apikey: <ANON_KEY>" -H "Authorization: Bearer <ANON_KEY>"

# harus tetap BERHASIL
curl -s "https://tghornkqkmmoblqhnvxk.supabase.co/rest/v1/users?select=id,username,nama&limit=1" \
  -H "apikey: <ANON_KEY>" -H "Authorization: Bearer <ANON_KEY>"
```

Lalu coba login sekali lagi untuk memastikan Edge Function tetap bisa membaca
kolom itu lewat service role.

## Rollback

- **Sebelum langkah 4:** revert commit aplikasi. Jalur lama langsung berfungsi.
- **Setelah langkah 4:** jalankan `grant select on public.users to anon;` untuk
  mengembalikan hak baca, lalu revert commit aplikasi.
