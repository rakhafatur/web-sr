export const monthNames = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const BIAYA_BULANAN_OUTLETS = ['Royal', 'SA', 'MTR'];
export const KASBON_ADMIN_JUMLAH = 500000;
export const DOKTER_SPEKULO_JUMLAH = 185000;

/**
 * Nominal biaya bulanan satu outlet. Spekulo & Gigi yang kosong (null) berarti
 * outlet itu memang tidak dikenakan biaya tersebut. Admin wajib ada di semua
 * outlet, jadi kalau kosong artinya salah konfigurasi.
 */
export type BiayaOutlet = {
  nama_outlet: string;
  kasbon_admin: number | null;
  dokter_spekulo: number | null;
  dokter_gigi: number | null;
};

export type KomponenBiaya = {
  nama: 'Admin' | 'Spekulo' | 'Gigi';
  tabel: 'kasbon' | 'dokter';
  keterangan: string;
  jumlah: number;
};

type NilaiNumeric = number | string | null | undefined;

// Kosong harus tetap kosong: Number(null) menghasilkan 0, yang artinya beda
// (0 = salah isi dan memblokir generate, kosong = tidak dikenakan).
const angkaAtauKosong = (nilai: NilaiNumeric) =>
  nilai === null || nilai === undefined ? null : Number(nilai);

export const bacaBiayaOutlet = (baris: {
  nama_outlet: string;
  kasbon_admin: NilaiNumeric;
  dokter_spekulo: NilaiNumeric;
  dokter_gigi: NilaiNumeric;
}): BiayaOutlet => ({
  nama_outlet: baris.nama_outlet,
  kasbon_admin: angkaAtauKosong(baris.kasbon_admin),
  dokter_spekulo: angkaAtauKosong(baris.dokter_spekulo),
  dokter_gigi: angkaAtauKosong(baris.dokter_gigi),
});

/**
 * Biaya yang berlaku untuk satu outlet pada satu periode (mis. "November 2026").
 * Admin selalu ikut, bernilai 0 kalau nominalnya tidak diketahui, supaya
 * pemeriksaan di modal memblokir generate alih-alih melewatinya diam-diam.
 */
export const komponenBiaya = (
  biaya: BiayaOutlet | undefined,
  periode: string
): KomponenBiaya[] => {
  const komponen: KomponenBiaya[] = [
    {
      nama: 'Admin',
      tabel: 'kasbon',
      keterangan: `Admin ${periode}`,
      jumlah: biaya?.kasbon_admin ?? 0,
    },
  ];

  if (biaya?.dokter_spekulo != null) {
    komponen.push({
      nama: 'Spekulo',
      tabel: 'dokter',
      keterangan: `Spekulo ${periode}`,
      jumlah: biaya.dokter_spekulo,
    });
  }

  if (biaya?.dokter_gigi != null) {
    komponen.push({
      nama: 'Gigi',
      tabel: 'dokter',
      keterangan: `Gigi ${periode}`,
      jumlah: biaya.dokter_gigi,
    });
  }

  return komponen;
};

export const kunciBiaya = (ladiesId: string, keterangan: string) =>
  `${ladiesId}|${keterangan}`;

/** `sudahAda` berisi kunciBiaya() dari baris yang sudah tersimpan di bulan itu. */
export const biayaBelumDibuat = (
  biaya: BiayaOutlet | undefined,
  periode: string,
  ladiesId: string,
  sudahAda: Set<string>
) =>
  komponenBiaya(biaya, periode).filter(
    (k) => !sudahAda.has(kunciBiaya(ladiesId, k.keterangan))
  );

export const formatRupiah = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (!num) return '';
  return `Rp${num.toLocaleString('id-ID')}`;
};

export const pad = (n: number) => String(n).padStart(2, '0');

export const getLastDay = (year: number, month: number) =>
  new Date(year, month, 0).getDate();
