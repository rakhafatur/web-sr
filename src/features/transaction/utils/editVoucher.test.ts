import { describe, expect, it } from 'vitest';
import { hitungUlangVoucher } from './editVoucher';

describe('hitungUlangVoucher', () => {
  it('memakai harga per pcs transaksi itu sendiri, bukan konstanta', () => {
    // Transaksi dibuat dengan harga ladies 160.000 & untung 80.000 per pcs.
    const lama = { jumlah: 320_000, jumlah_voucher: 2, untung: 160_000 };
    expect(hitungUlangVoucher(lama, 3)).toEqual({ jumlah: 480_000, untung: 240_000 });
  });

  it('pcs tidak berubah = nominal tidak berubah', () => {
    const lama = { jumlah: 450_000, jumlah_voucher: 3, untung: 225_000 };
    expect(hitungUlangVoucher(lama, 3)).toEqual({ jumlah: 450_000, untung: 225_000 });
  });

  it('untung kosong (transaksi lama) tetap kosong, tidak dikarang', () => {
    const lama = { jumlah: 300_000, jumlah_voucher: 2, untung: null };
    expect(hitungUlangVoucher(lama, 1)).toEqual({ jumlah: 150_000, untung: null });
  });

  it('tidak bisa dihitung kalau pcs lama nol — harga per pcs tidak diketahui', () => {
    const lama = { jumlah: 0, jumlah_voucher: 0, untung: 0 };
    expect(hitungUlangVoucher(lama, 2)).toBeNull();
  });

  it('pembulatan ke rupiah utuh untuk harga per pcs yang tidak bulat', () => {
    const lama = { jumlah: 100_000, jumlah_voucher: 3, untung: null };
    expect(hitungUlangVoucher(lama, 2)).toEqual({ jumlah: 66_667, untung: null });
  });
});
