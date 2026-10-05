import { ReactNode } from 'react';
import '../../styles/desktop-admin.css';

type Props = {
  title: string;
  description?: string;
  /** Tombol/pengingat di kanan judul (mis. "+ Tambah user"). */
  actions?: ReactNode;
};

/**
 * Header halaman admin desktop gaya baru — judul & deskripsi polos tanpa
 * kotak gradien, aksi di kanan. Uji coba di halaman Users; halaman lain
 * masih memakai FeaturePageHeader/ListPageHeader.
 */
const DesktopPageHeader = ({ title, description, actions }: Props) => (
  <header className="dk-head">
    <div className="dk-head-text">
      <h1 className="dk-title">{title}</h1>
      {description && <p className="dk-desc">{description}</p>}
    </div>
    {actions && <div className="dk-head-actions">{actions}</div>}
  </header>
);

export default DesktopPageHeader;
