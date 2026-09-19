/**
 * Pemetaan nilai status mentah dari database ke varian badge + label Indonesia.
 *
 * Sebelum ini pemetaannya ditulis sebagai `switch` berulang di LadiesListPage,
 * LadiesCardList, ProfilePage, CardTableAbsensi, dan dua komponen riwayat
 * transaksi — dan dua di antaranya tidak sepakat soal ejaan. LadiesListPage
 * memakai 'active'/'resign'/'not active' (huruf kecil), ProfilePage memakai
 * 'AKTIF'/'NONAKTIF'. Keduanya diterima di sini supaya tidak perlu lebih dulu
 * memastikan mana yang benar-benar tersimpan di Supabase.
 */

export type VarianStatus = 'success' | 'warning' | 'danger' | 'neutral' | 'brand';

export type InfoStatus = {
  varian: VarianStatus;
  label: string;
};

/** Samakan ejaan: huruf kecil, tanpa spasi tepi, garis bawah jadi spasi. */
function normalkan(mentah: string): string {
  return mentah.trim().toLowerCase().replace(/_/g, ' ');
}

/** "pemasukan lain" → "Pemasukan Lain". Dipakai sebagai cadangan supaya nilai
    tak dikenal tetap terbaca manusiawi, bukan snake_case mentah. */
function keTitleCase(teks: string): string {
  return teks
    .split(' ')
    .map((kata) => kata.charAt(0).toUpperCase() + kata.slice(1))
    .join(' ');
}

const STATUS: Record<string, InfoStatus> = {
  // Ladies — ejaan database
  active: { varian: 'success', label: 'Aktif' },
  'not active': { varian: 'warning', label: 'Nonaktif' },
  resign: { varian: 'danger', label: 'Resign' },
  // Ladies — ejaan Indonesia yang dipakai ProfilePage
  aktif: { varian: 'success', label: 'Aktif' },
  nonaktif: { varian: 'warning', label: 'Nonaktif' },
  // Absensi
  kerja: { varian: 'success', label: 'Kerja' },
  off: { varian: 'neutral', label: 'Off' },
  sakit: { varian: 'warning', label: 'Sakit' },
  mens: { varian: 'danger', label: 'Mens' },
};

const KATEGORI: Record<string, InfoStatus> = {
  voucher: { varian: 'warning', label: 'Voucher' },
  kasbon: { varian: 'danger', label: 'Kasbon' },
  dokter: { varian: 'brand', label: 'Dokter' },
  'pemasukan lain': { varian: 'success', label: 'Pemasukan Lain' },
  'kasbon pengawas': { varian: 'danger', label: 'Kasbon Pengawas' },
  'gaji pengawas': { varian: 'success', label: 'Gaji Pengawas' },
};

export function petakanStatus(mentah: string | null | undefined): InfoStatus {
  if (!mentah || !mentah.trim()) return { varian: 'neutral', label: '-' };

  const cocok = STATUS[normalkan(mentah)];
  if (cocok) return cocok;

  // Status tak dikenal ditampilkan persis seperti tersimpan, tanpa dirapikan —
  // supaya nilai yang salah di database langsung terlihat mencurigakan.
  return { varian: 'neutral', label: mentah.trim() };
}

export function petakanKategori(mentah: string | null | undefined): InfoStatus {
  if (!mentah || !mentah.trim()) return { varian: 'neutral', label: '-' };

  const kunci = normalkan(mentah);
  const cocok = KATEGORI[kunci];
  if (cocok) return cocok;

  // Kategori tak dikenal dirapikan jadi Title Case: tidak seperti status,
  // nilai kategori memang bisa bertambah dan snake_case mentah di layar
  // terbaca seperti bocoran nama kolom.
  return { varian: 'neutral', label: keTitleCase(kunci) };
}
