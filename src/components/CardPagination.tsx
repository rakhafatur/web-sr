import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const pillButtonStyle = {
  width: 34,
  height: 34,
  borderRadius: 10,
  background: '#f4f4f5',
};

const CardPagination = ({ page, totalPages, onPageChange }: Props) => (
  <div className="d-flex justify-content-center align-items-center gap-2 mt-1">
    <button
      className="btn border-0 d-flex align-items-center justify-content-center"
      style={pillButtonStyle}
      onClick={() => page > 0 && onPageChange(page - 1)}
      disabled={page === 0}
    >
      <FiChevronLeft size={15} />
    </button>

    <div style={{ fontSize: 11, fontWeight: 600, color: '#666', minWidth: 42, textAlign: 'center' }}>
      {page + 1}/{totalPages}
    </div>

    <button
      className="btn border-0 d-flex align-items-center justify-content-center"
      style={pillButtonStyle}
      onClick={() => page < totalPages - 1 && onPageChange(page + 1)}
      disabled={page >= totalPages - 1}
    >
      <FiChevronRight size={15} />
    </button>
  </div>
);

export default CardPagination;
