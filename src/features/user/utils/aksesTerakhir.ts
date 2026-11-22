/**
 * Format kolom `users.last_access_at` untuk admin.
 *
 * Nilainya diperbarui SessionGuard setiap kali app dibuka/kembali difokus
 * dan tiap 5 menit selama layar terbuka, jadi ketelitiannya ±5 menit.
 * `null` artinya user belum membuka app sejak kolom ini dibuat — bukan
 * "tidak pernah login", karena akses sebelum itu memang tidak tercatat.
 */

/** Error PostgREST "kolom tidak ada" — artinya SQL e5 belum dijalankan.
    Pembaca kolom ini mengulang query tanpa `last_access_at` supaya halaman
    Users tetap jalan sebelum kolomnya dibuat. */
export const kolomAksesBelumAda = (error: { code?: string } | null) =>
  error?.code === '42703';

const MENIT = 60 * 1000;

const jam = (d: Date) =>
  d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

const awalHari = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "Baru saja", "12 menit lalu", "Hari ini, 14.20", "Kemarin, 09.05",
    "3 hari lalu", lalu tanggal pendek "5 Mar 2026". */
export function formatAksesTerakhir(iso: string | null, sekarang: Date = new Date()): string {
  if (!iso) return 'Belum tercatat';

  const waktu = new Date(iso);
  if (Number.isNaN(waktu.getTime())) return 'Belum tercatat';

  // Jam device user bisa sedikit lebih cepat dari device admin — anggap
  // "baru saja" alih-alih menampilkan menit negatif.
  const selisih = sekarang.getTime() - waktu.getTime();
  if (selisih < MENIT) return 'Baru saja';
  if (selisih < 60 * MENIT) return `${Math.floor(selisih / MENIT)} menit lalu`;

  const selisihHari = Math.round((awalHari(sekarang) - awalHari(waktu)) / (24 * 60 * MENIT));
  if (selisihHari <= 0) return `Hari ini, ${jam(waktu)}`;
  if (selisihHari === 1) return `Kemarin, ${jam(waktu)}`;
  if (selisihHari < 7) return `${selisihHari} hari lalu`;

  return waktu.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Versi lengkap untuk halaman detail: "Minggu, 22 November 2026 pukul 14.20". */
export function formatAksesLengkap(iso: string | null): string | null {
  if (!iso) return null;
  const waktu = new Date(iso);
  if (Number.isNaN(waktu.getTime())) return null;
  const tanggal = waktu.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return `${tanggal} pukul ${jam(waktu)}`;
}
