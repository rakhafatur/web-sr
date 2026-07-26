import dayjs, { type Dayjs } from 'dayjs';
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
  borderRadius: 12,
  background: 'var(--color-surface-2)',
};

const MonthNavigator = ({ selectedMonth, onChange, onPrev, onNext, nextDisabled }: Props) => (
  <div className="d-flex align-items-center justify-content-between" style={{ gap: 10 }}>
    <button
      className="btn border-0 d-flex align-items-center justify-content-center"
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
        borderRadius: 12,
        height: 38,
        fontSize: 13,
        fontWeight: 600,
        border: '1px solid var(--color-gray-200)',
      }}
    />

    <button
      className="btn border-0 d-flex align-items-center justify-content-center"
      style={navButtonStyle}
      onClick={onNext}
      disabled={nextDisabled}
    >
      <FiChevronRight />
    </button>
  </div>
);

export default MonthNavigator;
