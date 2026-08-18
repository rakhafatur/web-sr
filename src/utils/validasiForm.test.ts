import { describe, it, expect } from 'vitest';
import { kosong, validasiWajib, validasiAngka } from './validasiForm';

describe('kosong', () => {
  it('menganggap string berisi spasi saja sebagai kosong', () => {
    // Ini bug yang ada sebelumnya: `!'   '` bernilai false, sehingga nama
    // berisi spasi lolos validasi dan tersimpan ke database.
    expect(kosong('   ')).toBe(true);
    expect(kosong('\t\n')).toBe(true);
  });

  it('menganggap string kosong, null, dan undefined sebagai kosong', () => {
    expect(kosong('')).toBe(true);
    expect(kosong(null)).toBe(true);
    expect(kosong(undefined)).toBe(true);
  });

  it('tidak menganggap angka nol sebagai kosong', () => {
    // 0 itu falsy — kalau dicek dengan `!nilai`, nominal nol akan salah
    // dianggap belum diisi.
    expect(kosong(0)).toBe(false);
  });

  it('tidak menganggap false sebagai kosong', () => {
    expect(kosong(false)).toBe(false);
  });

  it('menerima teks biasa', () => {
    expect(kosong('Budi')).toBe(false);
    expect(kosong(' Budi ')).toBe(false);
  });
});

describe('validasiWajib', () => {
  it('mengembalikan null kalau semua terisi', () => {
    expect(
      validasiWajib([
        { label: 'Nama lengkap', value: 'Budi' },
        { label: 'Nama ladies', value: 'Bubu' },
      ])
    ).toBeNull();
  });

  it('menyebut field yang kosong, bukan pesan umum', () => {
    expect(
      validasiWajib([
        { label: 'Nama lengkap', value: 'Budi' },
        { label: 'Nama ladies', value: '' },
      ])?.pesan
    ).toBe('Nama ladies wajib diisi.');
  });

  it('menggabungkan beberapa field yang kosong dengan rapi', () => {
    expect(
      validasiWajib([
        { label: 'Username', value: '' },
        { label: 'Nama', value: '' },
        { label: 'Password', value: '' },
      ])?.pesan
    ).toBe('Username, Nama dan Password wajib diisi.');
  });

  it('menangkap field yang hanya berisi spasi', () => {
    expect(
      validasiWajib([{ label: 'Nama agent', value: '   ' }])?.pesan
    ).toBe('Nama agent wajib diisi.');
  });

  it('mengembalikan null untuk daftar kosong', () => {
    expect(validasiWajib([])).toBeNull();
  });

  it('menunjuk field kosong yang pertama, bukan yang terakhir', () => {
    // Yang disorot harus yang pertama supaya layar tidak melompat ke bawah
    // padahal masih ada field kosong di atasnya.
    expect(
      validasiWajib([
        { label: 'Username', value: '', name: 'username' },
        { label: 'Nama', value: '', name: 'nama' },
      ])?.nama
    ).toBe('username');
  });

  it('memberi nama null kalau pemanggil tidak menyertakan name', () => {
    expect(validasiWajib([{ label: 'Nama agent', value: '' }])?.nama).toBeNull();
  });
});

describe('validasiAngka', () => {
  it('menerima angka yang sah, termasuk nol', () => {
    expect(
      validasiAngka([
        { label: 'Harga ladies', value: '150000' },
        { label: 'Untung', value: 0 },
      ])
    ).toBeNull();
  });

  it('menolak field yang belum diisi', () => {
    expect(validasiAngka([{ label: 'Harga ladies', value: '' }])?.pesan).toBe(
      'Harga ladies wajib diisi.'
    );
  });

  it('menolak teks yang bukan angka', () => {
    expect(validasiAngka([{ label: 'Untung', value: 'abc' }])?.pesan).toBe(
      'Untung harus berupa angka.'
    );
  });

  it('menolak angka negatif — nominal uang tidak boleh minus', () => {
    expect(validasiAngka([{ label: 'Harga ladies', value: '-5000' }])?.pesan).toBe(
      'Harga ladies tidak boleh negatif.'
    );
  });

  it('melaporkan field bermasalah yang pertama saja', () => {
    expect(
      validasiAngka([
        { label: 'Harga ladies', value: 'abc' },
        { label: 'Untung', value: 'juga salah' },
      ])?.pesan
    ).toBe('Harga ladies harus berupa angka.');
  });

  it('ikut menyebut name field yang bermasalah', () => {
    expect(
      validasiAngka([
        { label: 'Harga ladies', value: '150000', name: 'harga_ladies' },
        { label: 'Untung', value: '-1', name: 'untung' },
      ])?.nama
    ).toBe('untung');
  });
});
