import { describe, expect, it } from 'vitest';
import { petakanKategori, petakanStatus } from './statusMap';

describe('petakanStatus', () => {
  it('memetakan status ladies dari database', () => {
    expect(petakanStatus('active')).toEqual({ varian: 'success', label: 'Aktif' });
    expect(petakanStatus('not active')).toEqual({ varian: 'warning', label: 'Nonaktif' });
    expect(petakanStatus('resign')).toEqual({ varian: 'danger', label: 'Resign' });
  });

  it('menerima ejaan Indonesia yang dipakai ProfilePage', () => {
    expect(petakanStatus('AKTIF')).toEqual({ varian: 'success', label: 'Aktif' });
    expect(petakanStatus('NONAKTIF')).toEqual({ varian: 'warning', label: 'Nonaktif' });
  });

  it('tidak peduli besar-kecil huruf maupun spasi berlebih', () => {
    expect(petakanStatus('  ACTIVE  ')).toEqual({ varian: 'success', label: 'Aktif' });
    expect(petakanStatus('Not Active')).toEqual({ varian: 'warning', label: 'Nonaktif' });
    expect(petakanStatus('not_active')).toEqual({ varian: 'warning', label: 'Nonaktif' });
  });

  it('memetakan status absensi', () => {
    expect(petakanStatus('KERJA')).toEqual({ varian: 'success', label: 'Kerja' });
    expect(petakanStatus('OFF')).toEqual({ varian: 'neutral', label: 'Off' });
    expect(petakanStatus('SAKIT')).toEqual({ varian: 'warning', label: 'Sakit' });
    expect(petakanStatus('MENS')).toEqual({ varian: 'danger', label: 'Mens' });
  });

  it('menampilkan nilai apa adanya kalau tidak dikenal — jangan sembunyikan data', () => {
    expect(petakanStatus('entah')).toEqual({ varian: 'neutral', label: 'entah' });
  });

  it('memberi tanda strip kalau kosong', () => {
    expect(petakanStatus(null)).toEqual({ varian: 'neutral', label: '-' });
    expect(petakanStatus(undefined)).toEqual({ varian: 'neutral', label: '-' });
    expect(petakanStatus('   ')).toEqual({ varian: 'neutral', label: '-' });
  });
});

describe('petakanKategori', () => {
  it('memetakan kategori transaksi ladies', () => {
    expect(petakanKategori('voucher')).toEqual({ varian: 'warning', label: 'Voucher' });
    expect(petakanKategori('kasbon')).toEqual({ varian: 'danger', label: 'Kasbon' });
    expect(petakanKategori('dokter')).toEqual({ varian: 'brand', label: 'Dokter' });
    expect(petakanKategori('pemasukan_lain')).toEqual({
      varian: 'success',
      label: 'Pemasukan Lain',
    });
  });

  it('memetakan kategori transaksi pengawas', () => {
    expect(petakanKategori('kasbon_pengawas')).toEqual({
      varian: 'danger',
      label: 'Kasbon Pengawas',
    });
    expect(petakanKategori('gaji_pengawas')).toEqual({
      varian: 'success',
      label: 'Gaji Pengawas',
    });
  });

  it('merapikan kategori tidak dikenal jadi Title Case, bukan snake_case mentah', () => {
    expect(petakanKategori('biaya_bulanan')).toEqual({
      varian: 'neutral',
      label: 'Biaya Bulanan',
    });
  });
});
