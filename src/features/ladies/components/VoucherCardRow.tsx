import dayjs from 'dayjs';
import { motion } from 'framer-motion';

type Props = {
  tanggal: string;
  pcs: number;
  nominal: number;
  keterangan?: string | null;
  index?: number;
};

/** Baris riwayat Voucher versi lebih visual — badge tanggal ala kalender,
    nominal rata kanan (gaya bank statement), dan reveal staggered per
    baris. Uji coba di halaman Voucher dulu sebelum diterapkan ke
    Kasbon/Dokter/Pemasukan Lain — sengaja dipisah dari LedgerCardRow
    (dipakai bersama 4 halaman) supaya tidak ikut berubah semua. */
const VoucherCardRow = ({ tanggal, pcs, nominal, keterangan, index = 0 }: Props) => {
  const date = dayjs(tanggal);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.25 }}
      className="d-flex align-items-center gap-3"
    >
      {/* TANGGAL — ala kartu kalender */}
      <div
        style={{
          flexShrink: 0,
          width: 52,
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            background: 'var(--color-voucher)',
            color: '#fff',
            fontSize: 9,
            fontWeight: 700,
            padding: '3px 0',
            letterSpacing: 0.5,
          }}
        >
          {date.format('MMM').toUpperCase()}
        </div>

        <div
          style={{
            background: 'var(--color-voucher-soft)',
            fontSize: 18,
            fontWeight: 800,
            color: 'var(--color-voucher)',
            padding: '5px 0',
          }}
        >
          {date.format('DD')}
        </div>
      </div>

      {/* KETERANGAN */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 700,
            color: 'var(--color-gray-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          Voucher
        </div>

        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-gray-500)',
            marginTop: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {keterangan || 'Tidak ada catatan'}
        </div>
      </div>

      {/* NOMINAL — rata kanan */}
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        <div
          style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 800,
            color: 'var(--color-income)',
            lineHeight: 1.15,
          }}
        >
          {pcs} pcs
        </div>

        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-gray-500)',
            marginTop: 2,
          }}
        >
          Rp{nominal.toLocaleString('id-ID')}
        </div>
      </div>
    </motion.div>
  );
};

export default VoucherCardRow;
