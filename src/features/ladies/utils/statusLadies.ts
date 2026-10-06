/** Nilai status yang disimpan form admin, dengan label tampilannya. */
export const STATUS_LADIES = [
  { value: 'active', label: 'Aktif' },
  { value: 'not active', label: 'Nonaktif' },
  { value: 'resign', label: 'Resign' },
];

/** Nada badge per status (kelas dk-status is-*). */
export const TONE_STATUS: Record<string, 'on' | 'warn' | 'off'> = {
  active: 'on',
  'not active': 'warn',
  resign: 'off',
};
