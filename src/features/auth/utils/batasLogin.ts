/**
 * Batas percobaan login: 3 kali gagal → tombol Masuk dikunci 5 menit, lalu
 * jatahnya terisi lagi.
 *
 * Dihitung PER DEVICE (localStorage), bukan per akun — sengaja: hasil login
 * "invalid" tidak membedakan username salah dan password salah (lihat
 * AuthContext), jadi menghitung per akun di database akan membocorkan
 * username mana yang terdaftar.
 *
 * Ini rem untuk salah ketik & tebak-tebakan iseng, BUKAN pengaman: data
 * localStorage bisa dihapus user, dan verifikasi password masih jalan di
 * browser (lihat CLAUDE.md "Keamanan"). Batas yang sungguhan harus ikut
 * pindah ke Edge Function login.
 */

export const MAKS_PERCOBAAN = 3;
export const LAMA_KUNCI_MS = 5 * 60 * 1000;

export type CatatanLogin = {
  gagal: number;
  kunciSampai: number | null;
};

export const CATATAN_KOSONG: CatatanLogin = { gagal: 0, kunciSampai: null };

export type StatusLogin =
  | { terkunci: true; sisaMs: number }
  | { terkunci: false; sisaPercobaan: number; pernahGagal: boolean };

export function statusLogin(c: CatatanLogin, sekarang: number): StatusLogin {
  if (c.kunciSampai !== null && sekarang < c.kunciSampai) {
    return { terkunci: true, sisaMs: c.kunciSampai - sekarang };
  }
  // Kunci yang sudah lewat = jatah penuh lagi.
  const gagal = c.kunciSampai !== null ? 0 : c.gagal;
  return {
    terkunci: false,
    sisaPercobaan: Math.max(0, MAKS_PERCOBAAN - gagal),
    pernahGagal: gagal > 0,
  };
}

export function catatGagal(c: CatatanLogin, sekarang: number): CatatanLogin {
  const status = statusLogin(c, sekarang);
  if (status.terkunci) return c;

  const gagal = MAKS_PERCOBAAN - status.sisaPercobaan + 1;
  if (gagal >= MAKS_PERCOBAAN) {
    return { gagal: 0, kunciSampai: sekarang + LAMA_KUNCI_MS };
  }
  return { gagal, kunciSampai: null };
}

/** "4:05" — untuk hitung mundur di halaman login. */
export function formatSisaKunci(ms: number): string {
  const totalDetik = Math.max(0, Math.ceil(ms / 1000));
  const menit = Math.floor(totalDetik / 60);
  const detik = totalDetik % 60;
  return `${menit}:${String(detik).padStart(2, '0')}`;
}

const KUNCI_STORAGE = 'login-gagal';

/** Baca/tulis dibungkus try/catch: mode privat atau storage penuh tidak
    boleh membuat halaman login error — paling buruk batasnya tidak berlaku. */
export function bacaCatatan(): CatatanLogin {
  try {
    const raw = localStorage.getItem(KUNCI_STORAGE);
    if (!raw) return CATATAN_KOSONG;
    const c = JSON.parse(raw) as Partial<CatatanLogin>;
    return {
      gagal: typeof c.gagal === 'number' ? c.gagal : 0,
      kunciSampai: typeof c.kunciSampai === 'number' ? c.kunciSampai : null,
    };
  } catch {
    return CATATAN_KOSONG;
  }
}

export function simpanCatatan(c: CatatanLogin): void {
  try {
    if (c.gagal === 0 && c.kunciSampai === null) localStorage.removeItem(KUNCI_STORAGE);
    else localStorage.setItem(KUNCI_STORAGE, JSON.stringify(c));
  } catch {
    // abaikan — lihat komentar bacaCatatan
  }
}
