/**
 * Peran user yang sedang login, diturunkan dari kolom penugasan di tabel
 * `users` (diisi lewat Persetujuan User): `ladies_id` → ladies,
 * `pengawas_id` → pengawas, selain itu admin.
 *
 * Satu-satunya tempat aturan ini — tata letak menu, tujuan setelah login,
 * dan tombol "kembali ke Home" semuanya membaca dari sini.
 *
 * Ingat: ini hanya memilih tampilan. Nilainya berasal dari localStorage yang
 * bisa diedit user, jadi bukan otorisasi (lihat CLAUDE.md, bagian Keamanan).
 */
export type Peran = 'admin' | 'ladies' | 'pengawas';

type Penugasan = { ladies_id?: string | null; pengawas_id?: string | null } | null | undefined;

export const peranDari = (user: Penugasan): Peran => {
  if (user?.ladies_id) return 'ladies';
  if (user?.pengawas_id) return 'pengawas';
  return 'admin';
};

export const BERANDA: Record<Peran, string> = {
  admin: '/',
  ladies: '/ladies/home',
  pengawas: '/pengawas/home',
};
