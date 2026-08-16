import { useMediaQuery } from 'react-responsive';
import type { RekapAbsensi } from '../utils/rekapAbsensi';

type Props = {
  rekap: RekapAbsensi;
};

/** Warna tiap status mengikuti token kategori transaksi supaya konsisten
    dengan badge status di tabel & kartu absensi. */
const KARTU = [
  { key: 'KERJA', label: 'Kerja', bg: 'var(--color-income-soft)', color: 'var(--color-income)' },
  { key: 'MENS', label: 'Mens', bg: 'var(--color-expense-soft)', color: 'var(--color-expense)' },
  { key: 'OFF', label: 'Off', bg: 'var(--color-gray-200)', color: 'var(--color-gray-700)' },
  { key: 'SAKIT', label: 'Sakit', bg: 'var(--color-voucher-soft)', color: 'var(--color-voucher)' },
] as const;

/** Empat kartu jumlah hari per status di halaman Absensi. */
const AbsensiSummaryCards = ({ rekap }: Props) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <div className="row g-2 mb-4">
      {KARTU.map((item) => (
        <div className="col-6 col-lg-3" key={item.key}>
          <div
            className="h-100"
            style={{
              background: item.bg,
              borderRadius: isMobile ? 16 : 22,
              padding: isMobile ? '12px 14px' : '18px 20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                fontSize: isMobile ? '0.7rem' : '0.82rem',
                color: item.color,
                opacity: 0.8,
                fontWeight: 600,
              }}
            >
              {item.label}
            </div>

            <div
              style={{
                fontSize: isMobile ? '1.4rem' : '2rem',
                fontWeight: 800,
                lineHeight: 1.1,
                marginTop: 2,
                color: item.color,
              }}
            >
              {rekap[item.key]}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AbsensiSummaryCards;
