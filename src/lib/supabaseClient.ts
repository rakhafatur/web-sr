import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Kalau env var tidak ikut ter-build, `createClient` melempar error saat modul
 * ini pertama dimuat — sebelum React sempat render apa pun, jadi yang terlihat
 * user cuma layar hitam tanpa keterangan dan ErrorBoundary pun tidak kebagian.
 * Guard ini mengubahnya jadi pesan yang langsung memberi tahu apa yang kurang.
 */
if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [
    !supabaseUrl && 'VITE_SUPABASE_URL',
    !supabaseAnonKey && 'VITE_SUPABASE_ANON_KEY',
  ]
    .filter(Boolean)
    .join(' dan ');

  document.body.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;
                padding:24px;background:#0e0e10;color:#edeef0;
                font-family:'Segoe UI',system-ui,sans-serif;text-align:center">
      <div style="max-width:420px">
        <div style="font-size:40px;margin-bottom:16px">⚙️</div>
        <h1 style="font-size:20px;margin:0 0 12px">Konfigurasi belum lengkap</h1>
        <p style="font-size:14px;line-height:1.6;color:#9497a0;margin:0">
          Aplikasi tidak bisa terhubung ke server karena ${missing} tidak terpasang
          saat build. Hubungi admin untuk mengatur environment variable di hosting.
        </p>
      </div>
    </div>
  `;

  throw new Error(`Environment variable belum diset: ${missing}`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
