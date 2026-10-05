import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import '../../styles/desktop-admin.css';

type Props = {
  title: string;
  description?: string;
  /** Tombol/pengingat di kanan judul (mis. "+ Tambah user"). */
  actions?: ReactNode;
  /** Tautan kembali kecil di atas judul (halaman Tambah/Detail). */
  back?: { to: string; label: string };
};

/**
 * Header halaman admin desktop gaya baru — judul & deskripsi polos tanpa
 * kotak gradien, aksi di kanan, tautan kembali opsional di atas judul.
 */
const DesktopPageHeader = ({ title, description, actions, back }: Props) => {
  const navigate = useNavigate();

  return (
    <header className="dk-head">
      <div className="dk-head-text">
        {back && (
          <button type="button" className="dk-back" onClick={() => navigate(back.to)}>
            <FiArrowLeft aria-hidden />
            {back.label}
          </button>
        )}
        <h1 className="dk-title">{title}</h1>
        {description && <p className="dk-desc">{description}</p>}
      </div>
      {actions && <div className="dk-head-actions">{actions}</div>}
    </header>
  );
};

export default DesktopPageHeader;
