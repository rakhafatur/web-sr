import { ReactNode } from 'react';
import dayjs from 'dayjs';

type Props = {
  tanggal: string;
  mainLine: ReactNode;
  color: string;
  /** Baris kedua opsional di bawah mainLine (mis. konversi pcs → Rp di Voucher). */
  extraLine?: ReactNode;
  keterangan?: string | null;
};

/** Baris kartu ledger — dipakai seragam oleh Voucher/Kasbon/Dokter/Pemasukan Lain
    (sebelumnya masing-masing halaman menulis ulang struktur yang sama persis). */
const LedgerCardRow = ({ tanggal, mainLine, color, extraLine, keterangan }: Props) => (
  <div className="d-flex justify-content-between align-items-start">
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-gray-500)',
          fontWeight: 600,
          marginBottom: 'var(--space-2)',
        }}
      >
        {dayjs(tanggal).format('DD MMM YYYY')}
      </div>

      <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color, lineHeight: 1.1 }}>
        {mainLine}
      </div>

      {extraLine && (
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-gray-700)',
            marginTop: 'var(--space-1)',
            fontWeight: 600,
          }}
        >
          {extraLine}
        </div>
      )}

      <div
        style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-gray-500)',
          marginTop: 'var(--space-2)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {keterangan || 'Tidak ada catatan'}
      </div>
    </div>
  </div>
);

export default LedgerCardRow;
