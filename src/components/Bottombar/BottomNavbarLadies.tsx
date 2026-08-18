import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import {
  FiHome,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiChevronRight,
  FiBookOpen,
  FiCreditCard,
  FiActivity,
  FiMessageCircle,
} from 'react-icons/fi';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import './BottomNavbar.css';

type Tab = 'menu' | 'transaksi';

/**
 * Rute yang dimiliki tab Transaksi dan Menu. Tanpa ini keduanya hanya menyala
 * selama sheet-nya terbuka, jadi setelah membuka mis. halaman Kasbon tidak ada
 * penanda posisi sama sekali di navigasi bawah.
 */
const RUTE_TAB: Record<Tab, string[]> = {
  transaksi: [
    '/ladies/voucher',
    '/ladies/pemasukan_lain',
    '/ladies/kasbon',
    '/ladies/dokter',
  ],
  menu: ['/ladies/profile', '/ladies/peraturan', '/smart-chat-ladies'],
};

const tabDariRute = (pathname: string): Tab | null => {
  for (const [tab, daftar] of Object.entries(RUTE_TAB)) {
    if (daftar.some((rute) => pathname === rute || pathname.startsWith(`${rute}/`))) {
      return tab as Tab;
    }
  }
  return null;
};

function BottomNavbarLadies() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState<Tab | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);

  const isActive = (path: string) =>
    location.pathname.startsWith(path);

  const tabAktif = tabDariRute(location.pathname);

  // Selama sheet terbuka, tab itulah yang menyala; kalau tidak, URL yang menentukan.
  const menyala = (tab: Tab) =>
    activeModal ? activeModal === tab : tabAktif === tab;

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    closeModal();
  };

  useEffect(() => {
    if (!activeModal) return;

    modalRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeModal]);

  const renderMenuItem = (
    icon: React.ReactNode,
    label: string,
    path: string,
    badge?: string
  ) => (
    <button
      type="button"
      className="bottom-sheet-item"
      onClick={() => handleNavigate(path)}
    >
      <div className="bottom-sheet-item-left">
        <div className="bottom-sheet-icon">
          {icon}
        </div>

        <div>
          <div className="bottom-sheet-label">
            {label}
          </div>

          {badge && (
            <div className="bottom-sheet-badge">
              {badge}
            </div>
          )}
        </div>
      </div>

      <FiChevronRight className="bottom-sheet-arrow" />
    </button>
  );

  const renderModalContent = () => {
    const title = activeModal === 'transaksi' ? 'Transaksi' : 'Menu';

    return (
      <div
        className="bottom-modal-backdrop"
        onClick={closeModal}
      >
        <div
          className="bottom-modal"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          ref={modalRef}
          data-ptr-ignore
          onClick={(e) => e.stopPropagation()}
        >
          {/* HANDLE */}
          <div className="bottom-sheet-handle-wrapper">
            <div className="bottom-sheet-handle" />
          </div>

          {/* HEADER */}
          <div className="bottom-sheet-header">
            <div>
              <div className="bottom-sheet-title">
                {title}
              </div>

              <div className="bottom-sheet-subtitle">
                Kelola fitur dan navigasi aplikasi
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="bottom-sheet-content">
            {activeModal === 'transaksi' && (
              <>
                {/* Bukan "Input Transaksi": keempat halaman di bawah ini hanya
                    menampilkan riwayat — ladies tidak bisa menginput apa pun
                    di sana, jadi judul lama menjanjikan hal yang tidak ada. */}
                <div className="sheet-section-title">
                  Riwayat Transaksi
                </div>

                {renderMenuItem(
                  <FiCreditCard />,
                  'Voucher',
                  '/ladies/voucher'
                )}

                {renderMenuItem(
                  <FiDollarSign />,
                  'Pemasukan Lain',
                  '/ladies/pemasukan_lain'
                )}

                {renderMenuItem(
                  <FiBookOpen />,
                  'Kasbon',
                  '/ladies/kasbon'
                )}

                {renderMenuItem(
                  <FiActivity />,
                  'Dokter',
                  '/ladies/dokter'
                )}
              </>
            )}

            {activeModal === 'menu' && (
              <>
                <div className="sheet-section-title">
                  Account
                </div>

                {renderMenuItem(
                  <FiUser />,
                  'Profile',
                  '/ladies/profile'
                )}

                {renderMenuItem(
                  <FiMessageCircle />,
                  'Smart Chat',
                  '/smart-chat-ladies'
                )}

                {renderMenuItem(
                  <FiBookOpen />,
                  'Peraturan',
                  '/ladies/peraturan'
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bottom-navbar-wrapper">
        <div className="bottom-navbar">
          {/* HOME */}
          <button
            type="button"
            className={`nav-item ${
              !activeModal && isActive('/ladies/home') ? 'active' : ''
            }`}
            aria-label="Home"
            aria-current={isActive('/ladies/home') ? 'page' : undefined}
            onClick={() => {
              navigate('/ladies/home');
              closeModal();
            }}
          >
            <div className="nav-icon-wrapper">
              <FiHome className="nav-icon" />
            </div>

            <span>Home</span>
          </button>

          {/* TRANSAKSI */}
          <button
            type="button"
            className={`nav-item ${
              menyala('transaksi') ? 'active' : ''
            }`}
            aria-label="Transaksi"
            aria-expanded={activeModal === 'transaksi'}
            aria-current={tabAktif === 'transaksi' ? 'page' : undefined}
            onClick={() =>
              setActiveModal('transaksi')
            }
          >
            <div className="nav-icon-wrapper">
              <FiDollarSign className="nav-icon" />
            </div>

            <span>Transaksi</span>
          </button>

          {/* ABSENSI */}
          <button
            type="button"
            className={`nav-item ${
              !activeModal && isActive('/ladies/absensi') ? 'active' : ''
            }`}
            aria-label="Absensi"
            aria-current={isActive('/ladies/absensi') ? 'page' : undefined}
            onClick={() => {
              navigate('/ladies/absensi');
              closeModal();
            }}
          >
            <div className="nav-icon-wrapper">
              <FiCalendar className="nav-icon" />
            </div>

            <span>Absensi</span>
          </button>

          {/* MENU */}
          <button
            type="button"
            className={`nav-item ${
              menyala('menu') ? 'active' : ''
            }`}
            aria-label="Menu"
            aria-expanded={activeModal === 'menu'}
            aria-current={tabAktif === 'menu' ? 'page' : undefined}
            onClick={() => setActiveModal('menu')}
          >
            <div className="nav-icon-wrapper">
              <FiUser className="nav-icon" />
            </div>

            <span>Menu</span>
          </button>
        </div>
      </div>

      {activeModal &&
        ReactDOM.createPortal(
          renderModalContent(),
          document.body
        )}
    </>
  );
}

export default BottomNavbarLadies;
