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

export const formatRupiah = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (!num) return '';
  return `Rp${num.toLocaleString('id-ID')}`;
};

export const pad = (n: number) => String(n).padStart(2, '0');

export const getLastDay = (year: number, month: number) =>
  new Date(year, month, 0).getDate();
