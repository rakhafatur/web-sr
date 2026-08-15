import dayjs, { type Dayjs } from 'dayjs';
import { useMediaQuery } from 'react-responsive';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

type Props = {
  selectedMonth: Dayjs;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPrev: () => void;
  onNext: () => void;
  nextDisabled: boolean;
};

const navButtonStyle = {
  width: 38,
  height: 38,
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-surface-2)',
};

const MonthNavigator = ({ selectedMonth, onChange, onPrev, onNext, nextDisabled }: Props) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
  <div className="d-flex align-items-center justify-content-between" style={{ gap: 'var(--space-2)' }}>
    <button
      className="btn border-0 d-flex align-items-center justify-content-center tap-scale"
      style={navButtonStyle}
      onClick={onPrev}
    >
      <FiChevronLeft />
    </button>

    <input
      type="month"
      value={selectedMonth.format('YYYY-MM')}
      onChange={onChange}
      max={dayjs().format('YYYY-MM')}
      className="form-control"
      style={{
        borderRadius: 'var(--radius-md)',
        height: isMobile ? 42 : 38,
        // 16px di mobile — di bawah itu iOS otomatis nge-zoom saat difokus.
        fontSize: isMobile ? 16 : 'var(--font-size-sm)',
        fontWeight: 600,
        border: '1px solid var(--color-gray-200)',
      }}
    />

    <button
      className="btn border-0 d-flex align-items-center justify-content-center tap-scale"
      style={navButtonStyle}
      onClick={onNext}
      disabled={nextDisabled}
    >
      <FiChevronRight />
    </button>
  </div>
  );
};

export default MonthNavigator;
