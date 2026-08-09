/** Harga per voucher — satu-satunya sumber kebenaran, dipakai saat transaksi
    voucher baru dibuat. Laporan/tampilan lain TIDAK boleh menghitung ulang
    dari sini — baca kolom `jumlah`/`jumlah_voucher` yang sudah tersimpan di
    baris transaksinya, supaya perubahan harga di masa depan tidak mengubah
    angka transaksi lama. */
export function getHargaVoucher(outlet: string, travelType: 'Single' | 'Double'): number {
  if (outlet === 'Travel') {
    return travelType === 'Single' ? 105000 : 95000;
  }

  return 150000;
}

/** Bagian "untung" (agency) per voucher — sama prinsipnya dengan getHargaVoucher:
    dipakai sekali saat transaksi baru dibuat, lalu disnapshot ke kolom `untung`.
    Laporan baca nilai yang tersimpan, bukan hitung ulang dari sini. */
export function getUntungVoucher(outlet: string, travelType: 'Single' | 'Double'): number {
  if (outlet === 'Travel') {
    return travelType === 'Single' ? 45000 : 30000;
  }

  return 75000;
}
