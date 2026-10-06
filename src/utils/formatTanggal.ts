/** "2024-03-05" → "5 Maret 2024". Tanpa zona waktu supaya tidak bergeser hari. */
export const formatTanggal = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
