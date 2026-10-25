import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { FiEyeOff } from 'react-icons/fi';

import MobilePageBar from './MobilePageBar';
import DesktopPageHeader from './desktop/DesktopPageHeader';
import type { Halaman } from '../layout/menu';
import '../styles/mobile-admin.css';
import '../styles/desktop-admin.css';

type Props = {
  halaman: Halaman;
  /** Tujuan tombol kembali: '/' (admin) atau '/ladies/home'. */
  beranda: string;
  untukLadies: boolean;
};

/**
 * Pengganti isi halaman yang menunya dinonaktifkan di Pengaturan, saat
 * dibuka lewat tautan/URL langsung. Hanya tampilan — bukan pengaman (lihat
 * supabase/sql/e2-pengaturan-menu.sql).
 */
const MenuNonaktif = ({ halaman, beranda, untukLadies }: Props) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const navigate = useNavigate();
  const nama = halaman.namaLengkap ?? halaman.label;
  const k = isMobile ? 'tm' : 'dk';

  const isi = (
    <div className={`${k}-empty`}>
      <span className={`${k}-empty-icon`} aria-hidden>
        <FiEyeOff />
      </span>
      <h2 className={`${k}-empty-title`} style={{ margin: 0 }}>
        Menu {nama} sedang dinonaktifkan
      </h2>
      <div className={`${k}-empty-text`}>
        {untukLadies
          ? 'Menu ini sedang tidak tersedia. Hubungi admin kalau kamu membutuhkannya.'
          : 'Nyalakan lagi lewat Pengaturan → Menu aplikasi.'}
      </div>
      <button
        type="button"
        className={isMobile ? 'tm-btn tm-btn--primary' : 'dk-btn dk-btn--primary'}
        style={{ marginTop: 'var(--space-5)', padding: '0 var(--space-6)' }}
        onClick={() => navigate(beranda)}
      >
        Kembali ke Home
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <div className="tm-page">
        <MobilePageBar title={nama} backTo={beranda} />
        <div className="tm-group">{isi}</div>
      </div>
    );
  }

  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader title={nama} />
      <section className="dk-card">{isi}</section>
    </div>
  );
};

export default MenuNonaktif;
