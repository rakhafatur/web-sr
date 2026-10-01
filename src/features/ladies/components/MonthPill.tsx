import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './MonthPill.css';

type Props = {
  /** Teks yang tampil, mis. "Oktober 2026". */
  label: string;
  /** Nilai bulan "YYYY-MM" untuk input month. */
  value: string;
  /** Bulan terakhir yang boleh dipilih, "YYYY-MM". */
  max?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPrev: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
};

/**
 * Pemilih bulan berbentuk pil (‹ Oktober 2026 ›) untuk halaman ladies versi
 * mobile. Ketuk nama bulan untuk lompat ke bulan mana pun — input month
 * transparan ditaruh di atas label, jadi tampilannya tetap ikut tema.
 */
const MonthPill = ({ label, value, max, onChange, onPrev, onNext, nextDisabled }: Props) => (
  <div className="mp">
    <button type="button" className="mp-btn" onClick={onPrev} aria-label="Bulan sebelumnya">
      <FiChevronLeft />
    </button>
    <label className="mp-label">
      <span>{label}</span>
      <input
        type="month"
        className="mp-input"
        value={value}
        onChange={onChange}
        max={max}
        aria-label="Pilih bulan"
      />
    </label>
    <button
      type="button"
      className="mp-btn"
      onClick={onNext}
      disabled={nextDisabled}
      aria-label="Bulan berikutnya"
    >
      <FiChevronRight />
    </button>
  </div>
);

export default MonthPill;
