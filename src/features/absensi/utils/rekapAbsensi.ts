/**
 * Hitungan rekap absensi per status untuk satu bulan.
 *
 * Dipisah dari komponen supaya bisa diuji — angka "hari kerja" dari sini
 * dipakai untuk memantau kehadiran ladies, dan sebelumnya dihitung lewat
 * empat kali `.filter().length` terpisah yang gampang tidak sinkron kalau
 * daftar statusnya bertambah.
 */

/** Status yang dikenal sistem. Urutannya mengikuti tampilan di UI. */
export const STATUS_ABSENSI = ['KERJA', 'MENS', 'OFF', 'SAKIT'] as const;

export type StatusAbsensi = (typeof STATUS_ABSENSI)[number];

export type RekapAbsensi = Record<StatusAbsensi, number>;

/** Baris absensi apa adanya dari Supabase. */
type BarisAbsensi = { status: string };

/**
 * Hitung jumlah hari per status dalam satu lintasan.
 *
 * Status yang tidak dikenal sengaja diabaikan, bukan dimasukkan ke salah satu
 * kategori — supaya data nyasar terlihat sebagai selisih, bukan diam-diam
 * menambah angka kategori yang salah.
 */
export function hitungRekapAbsensi(rows: BarisAbsensi[]): RekapAbsensi {
  const rekap: RekapAbsensi = { KERJA: 0, MENS: 0, OFF: 0, SAKIT: 0 };

  for (const row of rows) {
    if (row.status in rekap) {
      rekap[row.status as StatusAbsensi] += 1;
    }
  }

  return rekap;
}
