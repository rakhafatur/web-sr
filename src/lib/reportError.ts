import { supabase } from './supabaseClient';

/**
 * Pelaporan error terpusat.
 *
 * Sebelumnya crash yang dialami user hanya masuk `console.error` di browser
 * mereka — begitu tab ditutup, jejaknya hilang dan tidak ada cara menelusuri
 * apa yang terjadi. Fungsi ini mengirimkannya ke tabel `error_logs` di
 * Supabase supaya bisa dilihat belakangan.
 *
 * Sifatnya SELALU best-effort:
 * - tidak pernah melempar error (pelaporan yang gagal tidak boleh menambah
 *   masalah di atas masalah yang sedang dilaporkan)
 * - kalau tabel `error_logs` belum dibuat, pengirimannya diam-diam dilewati
 *   dan cukup tercatat di console — jadi kode ini aman dirilis lebih dulu,
 *   dan otomatis mulai bekerja begitu SQL-nya dijalankan
 * - dibatasi supaya satu error yang berulang (mis. di dalam render loop)
 *   tidak membanjiri tabel
 */

type Konteks = {
  /** Dari mana error-nya berasal, mis. 'ErrorBoundary' atau 'query'. */
  sumber: string;
  /** Keterangan tambahan, mis. nama query atau componentStack. */
  detail?: string;
};

/** Jeda minimum sebelum error dengan sidik jari sama dikirim lagi. */
const JEDA_ULANG_MS = 60_000;

/** Batas jumlah laporan per sesi, sebagai pengaman terakhir. */
const BATAS_PER_SESI = 20;

const terakhirDikirim = new Map<string, number>();
let jumlahTerkirim = 0;

/** Matikan pengiriman kalau tabelnya memang belum ada — supaya tidak mencoba
    terus-menerus dan mengotori console dengan kegagalan yang sama. */
let pengirimanAktif = true;

const pesanDari = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

export async function reportError(error: unknown, konteks: Konteks): Promise<void> {
  const pesan = pesanDari(error);
  const stack = error instanceof Error ? error.stack : undefined;

  // Console tetap jalan di semua kondisi — ini yang menolong saat development.
  console.error(`[${konteks.sumber}]`, error, konteks.detail ?? '');

  if (!pengirimanAktif || jumlahTerkirim >= BATAS_PER_SESI) return;

  // Sidik jari sederhana: sumber + pesan. Cukup untuk menahan error yang sama
  // berulang cepat, tanpa menahan error berbeda yang kebetulan berdekatan.
  const sidik = `${konteks.sumber}|${pesan}`;
  const sekarang = Date.now();
  const sebelumnya = terakhirDikirim.get(sidik);

  if (sebelumnya && sekarang - sebelumnya < JEDA_ULANG_MS) return;
  terakhirDikirim.set(sidik, sekarang);

  try {
    let userId: string | null = null;

    try {
      const tersimpan = localStorage.getItem('user');
      if (tersimpan) userId = JSON.parse(tersimpan)?.id ?? null;
    } catch {
      // Sesi rusak/tidak terbaca bukan alasan membatalkan laporan.
    }

    const { error: gagalKirim } = await supabase.from('error_logs').insert({
      pesan: pesan.slice(0, 1000),
      stack: stack?.slice(0, 4000) ?? null,
      sumber: konteks.sumber,
      detail: konteks.detail?.slice(0, 2000) ?? null,
      halaman: window.location.pathname,
      user_agent: navigator.userAgent.slice(0, 500),
      user_id: userId,
    });

    if (gagalKirim) {
      // 42P01 = tabel belum ada. Itu kondisi yang diharapkan sebelum SQL
      // dijalankan, jadi jangan diperlakukan sebagai kegagalan berulang.
      pengirimanAktif = false;
      console.warn(
        '[reportError] pengiriman dimatikan untuk sesi ini:',
        gagalKirim.message
      );
      return;
    }

    jumlahTerkirim += 1;
  } catch (err) {
    // Jangan pernah biarkan pelaporan error justru melempar error.
    pengirimanAktif = false;
    console.warn('[reportError] gagal mengirim laporan:', err);
  }
}

/**
 * Tangkap error yang lolos dari React — mis. di dalam event handler async
 * atau promise yang tidak di-catch. ErrorBoundary tidak menangkap keduanya.
 */
export function pasangPenangkapGlobal(): void {
  window.addEventListener('error', (e) => {
    reportError(e.error ?? e.message, { sumber: 'window.onerror' });
  });

  window.addEventListener('unhandledrejection', (e) => {
    reportError(e.reason, { sumber: 'unhandledrejection' });
  });
}
