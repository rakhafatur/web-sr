import { useMediaQuery } from 'react-responsive';
import { STATUS_ABSENSI } from '../utils/rekapAbsensi';

type Props = {
  value: string;
  onChange: (status: string) => void;
};

/** Pemilih status absensi (Kerja/Mens/Off/Sakit). Daftar statusnya diambil
    dari STATUS_ABSENSI supaya tidak perlu diperbarui di dua tempat kalau
    suatu saat ada status baru. */
const StatusPicker = ({ value, onChange }: Props) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(4, auto)',
        gap: isMobile ? 8 : 10,
      }}
    >
      {STATUS_ABSENSI.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`btn segmented-chip${value === opt ? ' active' : ''}`}
          style={{
            height: isMobile ? 42 : 46,
            padding: isMobile ? '0 6px' : '0 16px',
            fontSize: isMobile ? '0.7rem' : '0.88rem',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

export default StatusPicker;
