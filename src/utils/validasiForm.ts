/**
 * Validasi form yang dipakai bersama semua halaman Create/Detail.
 *
 * Sebelumnya tiap form menulis pengecekannya sendiri dengan gaya berbeda —
 * ada yang menyebut nama field, ada yang cuma "Semua field wajib diisi" —
 * dan semuanya memakai `!nilai` yang MELOLOSKAN input berisi spasi saja,
 * sehingga nama kosong bisa tersimpan ke database.
 */

export type FieldWajib = {
  /** Nama field seperti yang dilihat user, dipakai di pesan error. */
  label: string;
  value: unknown;
};

/** Kosong = null, undefined, string kosong, atau string berisi spasi saja. */
export function kosong(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  return false;
}

/**
 * Kembalikan pesan untuk field wajib pertama yang kosong, atau null kalau
 * semuanya terisi.
 *
 * Sengaja menyebut field yang bermasalah, bukan pesan umum — user tidak perlu
 * menebak field mana yang belum diisi.
 */
export function validasiWajib(fields: FieldWajib[]): string | null {
  const kurang = fields.filter((f) => kosong(f.value));

  if (kurang.length === 0) return null;
  if (kurang.length === 1) return `${kurang[0].label} wajib diisi.`;

  const labels = kurang.map((f) => f.label);
  const terakhir = labels.pop();

  return `${labels.join(', ')} dan ${terakhir} wajib diisi.`;
}

/**
 * Validasi field yang harus berupa angka. Field kosong dianggap belum diisi
 * (bukan nol) supaya tidak diam-diam tersimpan sebagai 0 — penting untuk
 * field nominal uang.
 */
export function validasiAngka(fields: FieldWajib[]): string | null {
  for (const f of fields) {
    if (kosong(f.value)) return `${f.label} wajib diisi.`;

    const angka = Number(f.value);
    if (Number.isNaN(angka)) return `${f.label} harus berupa angka.`;
    if (angka < 0) return `${f.label} tidak boleh negatif.`;
  }

  return null;
}
