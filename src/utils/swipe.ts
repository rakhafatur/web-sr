/** Kecepatan (px/detik, ke kiri) yang dianggap "usapan cepat". */
export const AMBANG_KECEPATAN = 500;

/** Jarak minimal (px) sebelum kecepatan ikut diperhitungkan. Tanpa ini,
    getaran jari saat mengetuk (beberapa piksel dalam beberapa milidetik)
    terbaca sebagai usapan cepat dan membuka baris. */
export const JARAK_MINIMAL_USAPAN = 16;

/**
 * Apakah baris swipe-to-delete harus terbuka setelah jari diangkat.
 *
 * Terbuka kalau digeser lewat setengah lebar tombol hapus, ATAU diusap
 * cepat ke kiri yang jaraknya sudah melewati JARAK_MINIMAL_USAPAN.
 *
 * @param offsetX   total pergeseran horizontal (negatif = ke kiri)
 * @param velocityX kecepatan saat dilepas (negatif = ke kiri)
 * @param lebarTombol lebar tombol hapus yang disingkap
 */
export function harusTerbuka(offsetX: number, velocityX: number, lebarTombol: number): boolean {
  const lewatSetengah = offsetX < -lebarTombol / 2;
  const usapanCepat = velocityX < -AMBANG_KECEPATAN && offsetX < -JARAK_MINIMAL_USAPAN;
  return lewatSetengah || usapanCepat;
}
