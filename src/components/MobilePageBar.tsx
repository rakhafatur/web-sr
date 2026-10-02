import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import './MobilePageBar.css';

type Props = {
  title: string;
  /** Tujuan tombol kembali, mis. '/ladies/home' atau '/'. */
  backTo: string;
  /** Aksi utama halaman di kanan (mis. tombol + untuk menambah data). */
  action?: {
    icon: ReactNode;
    /** Label untuk pembaca layar. */
    label: string;
    onClick: () => void;
  };
};

/**
 * Bar atas halaman versi mobile: tombol kembali + judul di tengah, dengan
 * aksi opsional di kanan. Dipakai halaman yang Header app-nya dicabut di
 * MainLayout (lihat RUTE_LADIES_TANPA_HEADER & RUTE_ADMIN_TANPA_HEADER).
 */
const MobilePageBar = ({ title, backTo, action }: Props) => {
  const navigate = useNavigate();

  return (
    <header className="mpb">
      <button
        type="button"
        className="mpb-btn"
        onClick={() => navigate(backTo)}
        aria-label="Kembali"
      >
        <FiArrowLeft />
      </button>
      <h1 className="mpb-title">{title}</h1>
      {action ? (
        <button
          type="button"
          className="mpb-btn mpb-btn--action"
          onClick={action.onClick}
          aria-label={action.label}
        >
          {action.icon}
        </button>
      ) : (
        <span className="mpb-btn" aria-hidden />
      )}
    </header>
  );
};

export default MobilePageBar;
