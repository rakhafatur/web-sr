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
  /** Atribut `name` field-nya. Dipakai form untuk menyorot field yang
      bermasalah; boleh dikosongkan kalau form tidak memakai penyorotan. */
  name?: string;
};

export type HasilValidasi = {
  /** Pesan siap tampil untuk toast. */
  pesan: string;
  /** Field pertama yang bermasalah, atau null kalau pemanggil tidak
      menyertakan `name`. Aturan validasinya sendiri tidak berubah — ini
      hanya keterangan tambahan supaya form bisa menunjukkan letaknya. */
  nama: string | null;
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
export function validasiWajib(fields: FieldWajib[]): HasilValidasi | null {
  const kurang = fields.filter((f) => kosong(f.value));

  if (kurang.length === 0) return null;

  // Yang disorot selalu yang pertama, biar layar tidak melompat-lompat kalau
  // beberapa field sekaligus kosong.
  const nama = kurang[0].name ?? null;

  if (kurang.length === 1) {
    return { pesan: `${kurang[0].label} wajib diisi.`, nama };
  }

  const labels = kurang.map((f) => f.label);
  const terakhir = labels.pop();

  return { pesan: `${labels.join(', ')} dan ${terakhir} wajib diisi.`, nama };
}

/**
 * Validasi field yang harus berupa angka. Field kosong dianggap belum diisi
 * (bukan nol) supaya tidak diam-diam tersimpan sebagai 0 — penting untuk
 * field nominal uang.
 */
export function validasiAngka(fields: FieldWajib[]): HasilValidasi | null {
  for (const f of fields) {
    const nama = f.name ?? null;

    if (kosong(f.value)) return { pesan: `${f.label} wajib diisi.`, nama };

    const angka = Number(f.value);
    if (Number.isNaN(angka)) return { pesan: `${f.label} harus berupa angka.`, nama };
    if (angka < 0) return { pesan: `${f.label} tidak boleh negatif.`, nama };
  }

  return null;
}
