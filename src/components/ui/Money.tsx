import { formatRupiah, formatRupiahPenuh, type ArahUang } from '../../lib/uang';

type UkuranUang = 'sm' | 'base' | 'lg' | 'display';

type Props = {
  value: number;
  /** Menentukan warna. 'netral' memakai warna teks biasa. */
  arah?: ArahUang;
  /** Tampilkan + / − di depan. Warna saja tidak cukup bagi pengguna buta warna. */
  tampilkanTanda?: boolean;
  ukuran?: UkuranUang;
};

const WARNA: Record<ArahUang, string> = {
  masuk: 'text-money-in',
  keluar: 'text-money-out',
  netral: 'text-fg',
};

const UKURAN: Record<UkuranUang, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  display: 'text-display tracking-tight',
};

/** Awalan "Rp" selalu lebih kecil & redup dari digitnya: yang dibaca orang
    adalah angkanya, bukan mata uangnya. */
const AWALAN: Record<UkuranUang, string> = {
  sm: 'text-xs',
  base: 'text-xs',
  lg: 'text-sm',
  display: 'text-xl',
};

/**
 * Satu-satunya cara menampilkan nominal rupiah di UI baru.
 *
 * Angka memakai `tabular-nums` supaya digit sejajar antar baris — tanpa itu
 * kolom nominal di tabel tidak bisa dibandingkan sekilas.
 */
const Money = ({
  value,
  arah = 'netral',
  tampilkanTanda = false,
  ukuran = 'base',
}: Props) => {
  const tanda =
    !tampilkanTanda || arah === 'netral' ? '' : arah === 'masuk' ? '+' : '−';

  return (
    <span
      className={[
        'tabular inline-flex items-baseline gap-1 font-medium',
        UKURAN[ukuran],
        WARNA[arah],
      ].join(' ')}
      aria-label={`${tanda}${formatRupiahPenuh(Math.abs(value))}`}
    >
      {tanda && <span aria-hidden="true">{tanda}</span>}
      <span className={`${AWALAN[ukuran]} text-fg-faint font-normal`} aria-hidden="true">
        Rp
      </span>
      <span aria-hidden="true">{formatRupiah(value)}</span>
    </span>
  );
};

export default Money;
