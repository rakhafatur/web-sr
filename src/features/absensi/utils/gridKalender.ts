/**
 * Susunan sel kalender satu bulan, minggu dimulai Senin (kebiasaan Indonesia).
 *
 * Mengembalikan daftar sel berurutan baris demi baris: tanggal "YYYY-MM-DD"
 * untuk hari di bulan itu, `null` untuk sel kosong di depan (sebelum tanggal 1)
 * dan di belakang (supaya minggu terakhir genap 7 kolom).
 *
 * Dihitung dengan komponen tanggal lokal (bukan string ISO/UTC) supaya tidak
 * bergeser sehari di zona waktu WIB.
 *
 * @param tahun  mis. 2026
 * @param bulan0 bulan berbasis 0 (Januari = 0), sama seperti Date.getMonth()
 */
export function buatGridBulan(tahun: number, bulan0: number): (string | null)[] {
  const hariPertama = new Date(tahun, bulan0, 1).getDay(); // 0 = Minggu
  const kosongDepan = (hariPertama + 6) % 7; // Senin = 0 … Minggu = 6
  const jumlahHari = new Date(tahun, bulan0 + 1, 0).getDate();

  const mm = String(bulan0 + 1).padStart(2, '0');
  const sel: (string | null)[] = Array(kosongDepan).fill(null);

  for (let hari = 1; hari <= jumlahHari; hari++) {
    sel.push(`${tahun}-${mm}-${String(hari).padStart(2, '0')}`);
  }

  while (sel.length % 7 !== 0) sel.push(null);

  return sel;
}
