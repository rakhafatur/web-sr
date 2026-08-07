import { ReactNode } from 'react';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

type Props = {
  tanggal: string;
  label: string;
  color: string;
  colorSoft: string;
  mainValue: ReactNode;
  subValue?: ReactNode;
  keterangan?: string | null;
  index?: number;
};

/** Baris riwayat ledger versi compact — dipakai seragam oleh
    Voucher/Kasbon/Dokter/Pemasukan Lain: badge tanggal ala kalender +
    nilai rata kanan (gaya bank statement) + reveal staggered per baris.
    Ukuran sengaja dibuat ringkas (bukan seperti draft awal di Voucher)
    supaya ~5 baris muat satu layar tanpa perlu scroll. */
const LedgerCardRowV2 = ({
  tanggal,
  label,
  color,
  colorSoft,
  mainValue,
  subValue,
  keterangan,
  index = 0,
}: Props) => {
  const date = dayjs(tanggal);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.03, duration: 0.2 }}
      className="d-flex align-items-center gap-2"
    >
      {/* TANGGAL — ala kartu kalender */}
      <div
        style={{
          flexShrink: 0,
          width: 40,
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            background: color,
            color: '#fff',
            fontSize: 8,
            fontWeight: 700,
            padding: '2px 0',
            letterSpacing: 0.4,
          }}
        >
          {date.format('MMM').toUpperCase()}
        </div>

        <div
          style={{
            background: colorSoft,
            fontSize: 14,
            fontWeight: 800,
            color,
            padding: '3px 0',
          }}
        >
          {date.format('DD')}
        </div>
      </div>

      {/* KETERANGAN */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--color-gray-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-gray-500)',
            marginTop: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {keterangan || 'Tidak ada catatan'}
        </div>
      </div>

      {/* NILAI — rata kanan */}
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        <div
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 800,
            color,
            lineHeight: 1.15,
            whiteSpace: 'nowrap',
          }}
        >
          {mainValue}
        </div>

        {subValue && (
          <div
            style={{
              fontSize: 10,
              color: 'var(--color-gray-500)',
              marginTop: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {subValue}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LedgerCardRowV2;
