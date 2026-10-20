/**
 * Nilai kolom `pengawas.status` dengan label tampilannya. Nilainya sengaja
 * sama dengan status ladies ('active' / 'not active') karena halaman Add
 * Transaksi Pengawas sudah memfilter `status = 'active'`.
 */
export const STATUS_PENGAWAS = [
  { value: 'active', label: 'Aktif' },
  { value: 'not active', label: 'Nonaktif' },
];

/** Nada badge per status (kelas dk-status is-*) — sama dengan ladies. */
export const TONE_STATUS_PENGAWAS: Record<string, 'on' | 'warn'> = {
  active: 'on',
  'not active': 'warn',
};

/** Badge siap pakai untuk daftar; undefined kalau status tak dikenal. */
export const badgeStatusPengawas = (status: string | null | undefined) => {
  const s = STATUS_PENGAWAS.find((o) => o.value === status);
  return s ? { label: s.label, tone: TONE_STATUS_PENGAWAS[s.value] } : undefined;
};
