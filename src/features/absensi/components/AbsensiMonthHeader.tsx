import { useMediaQuery } from 'react-responsive';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

type Props = {
  bulanLabel: string;
  tahun: number;
  onPrev: () => void;
  onNext: () => void;
};

/** Judul "Rekap Absensi" + navigasi bulan di halaman Absensi. */
const AbsensiMonthHeader = ({ bulanLabel, tahun, onPrev, onNext }: Props) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const navButtonStyle: React.CSSProperties = {
    width: isMobile ? 34 : 40,
    height: isMobile ? 34 : 40,
    borderRadius: 12,
    background: 'var(--color-surface-2)',
    padding: 0,
  };

  return (
    <div
      className="d-flex justify-content-between align-items-center mb-3"
      style={{ gap: 12 }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          className="fw-bold"
          style={{
            fontSize: isMobile ? '0.92rem' : '1.1rem',
            color: 'var(--color-dark)',
            lineHeight: 1.1,
          }}
        >
          Rekap Absensi
        </div>

        <div
          style={{
            fontSize: isMobile ? '0.72rem' : '0.9rem',
            color: 'var(--color-gray-500)',
            marginTop: 2,
          }}
        >
          {bulanLabel} {tahun}
        </div>
      </div>

      <div className="d-flex align-items-center" style={{ gap: 6, flexShrink: 0 }}>
        <button
          className="btn border-0 d-flex align-items-center justify-content-center"
          onClick={onPrev}
          aria-label="Bulan sebelumnya"
          style={navButtonStyle}
        >
          <FiChevronLeft />
        </button>

        <button
          className="btn border-0 d-flex align-items-center justify-content-center"
          onClick={onNext}
          aria-label="Bulan berikutnya"
          style={navButtonStyle}
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default AbsensiMonthHeader;
