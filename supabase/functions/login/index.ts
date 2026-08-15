// Edge Function: login
//
// !!! BELUM AKTIF !!!
// AuthContext.tsx SENGAJA masih memakai jalur lama (bcrypt.compare di browser).
// Jangan sambungkan klien ke fungsi ini sebelum fungsinya ter-deploy DAN lolos
// uji curl di README — kalau dibalik, semua orang langsung tidak bisa login.
// Urutan lengkapnya ada di README.md folder ini.
//
// Memindahkan verifikasi password dari browser ke server. Sebelum ini,
// AuthContext.tsx menarik kolom `password` (hash bcrypt) ke browser lalu
// membandingkannya di sana — yang memaksa kolom hash bisa dibaca publik.
//
// Fungsi ini memakai service role key sehingga tetap bisa membaca kolom
// tersebut setelah hak baca anon dicabut (lihat sql/b4-revoke-password.sql).
//
// Deploy: Dashboard Supabase -> Edge Functions -> New function -> nama "login"
// (Supabase CLI belum dipakai di project ini.)

import { createClient } from 'jsr:@supabase/supabase-js@2';
// Sengaja memakai bcryptjs versi sama dengan yang dipakai app (package.json),
// supaya hash $2b$10$ yang sudah tersimpan dijamin cocok.
import bcrypt from 'npm:bcryptjs@3.0.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/** Hash asal-asalan yang valid secara format, dipakai untuk membuang waktu
    saat username tidak ditemukan — supaya lama respons tidak membocorkan
    username mana yang terdaftar. */
const DUMMY_HASH = '$2b$10$C6UzMDM.H6dfI/f/IKcEeO3nQ8/9Zx.6Q4jZ0yQmVQ0nZ9dJ0K1Hy';

type LoginResult = 'success' | 'inactive' | 'invalid' | 'error';

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const fail = (result: LoginResult, status = 200) => json({ result }, status);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { username, password } = await req.json();

    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
      return fail('invalid');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, nama, password, is_active, user_group_id, ladies_id, pengawas_id')
      .eq('username', username.trim())
      .maybeSingle();

    if (error) {
      console.error('login: gagal query users', error.message);
      return fail('error', 500);
    }

    if (!user) {
      // Tetap jalankan compare supaya waktu respons mirip kasus user ada.
      await bcrypt.compare(password, DUMMY_HASH);
      return fail('invalid');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return fail('invalid');

    if (!user.is_active) return fail('inactive');

    // Bentuk ulang eksplisit tanpa `password` — hash tidak boleh keluar dari
    // server dalam bentuk apa pun.
    return json({
      result: 'success',
      user: {
        id: user.id,
        username: user.username,
        nama: user.nama,
        is_active: user.is_active,
        user_group_id: user.user_group_id,
        ladies_id: user.ladies_id,
        pengawas_id: user.pengawas_id,
      },
    });
  } catch (err) {
    console.error('login: exception', err instanceof Error ? err.message : err);
    return fail('error', 500);
  }
});
