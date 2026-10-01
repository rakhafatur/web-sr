import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import './LedgerPageMobile.css';

/**
 * Bar atas halaman ladies versi mobile: tombol kembali ke Home + judul di
 * tengah. Dipakai halaman yang Header app-nya dicabut di MainLayout
 * (RUTE_LADIES_TANPA_HEADER).
 */
const LadiesPageBar = ({ title }: { title: string }) => {
  const navigate = useNavigate();

  return (
    <header className="lp-bar">
      <button
        type="button"
        className="lp-icon-btn"
        onClick={() => navigate('/ladies/home')}
        aria-label="Kembali ke Home"
      >
        <FiArrowLeft />
      </button>
      <h1 className="lp-bar-title">{title}</h1>
      <span className="lp-icon-btn" aria-hidden />
    </header>
  );
};

export default LadiesPageBar;
