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

function BottomNavbarLadies() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState<
    'menu' | 'transaksi' | null
  >(null);

  const modalRef = useRef<HTMLDivElement | null>(null);

  const isActive = (path: string) =>
    location.pathname.startsWith(path);

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
                <div className="sheet-section-title">
                  Input Transaksi
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
              isActive('/ladies/home')
                ? 'active'
                : ''
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
              activeModal === 'transaksi'
                ? 'active'
                : ''
            }`}
            aria-label="Transaksi"
            aria-expanded={activeModal === 'transaksi'}
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
              isActive('/ladies/absensi')
                ? 'active'
                : ''
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
              activeModal === 'menu'
                ? 'active'
                : ''
            }`}
            aria-label="Menu"
            aria-expanded={activeModal === 'menu'}
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
