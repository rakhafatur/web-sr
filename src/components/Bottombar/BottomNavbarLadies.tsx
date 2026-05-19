import React, { useState } from 'react';
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
} from 'react-icons/fi';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import './BottomNavbarLadies.css';

function BottomNavbarLadies() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState<
    'menu' | 'transaksi' | null
  >(null);

  const isActive = (path: string) =>
    location.pathname.startsWith(path);

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    closeModal();
  };

  const renderMenuItem = (
    icon: React.ReactNode,
    label: string,
    path: string,
    badge?: string
  ) => (
    <div
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
    </div>
  );

  const renderModalContent = () => (
    <div
      className="bottom-modal-backdrop"
      onClick={closeModal}
    >
      <div
        className="bottom-modal"
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
              {activeModal === 'transaksi'
                ? 'Transaksi'
                : 'Menu'}
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

  return (
    <>
      <div className="bottom-navbar-wrapper">
        <div className="bottom-navbar">
          {/* HOME */}
          <div
            className={`nav-item ${
              isActive('/ladies/home')
                ? 'active'
                : ''
            }`}
            onClick={() => {
              navigate('/ladies/home');
              closeModal();
            }}
          >
            <div className="nav-icon-wrapper">
              <FiHome className="nav-icon" />
            </div>

            <span>Home</span>
          </div>

          {/* TRANSAKSI */}
          <div
            className={`nav-item ${
              activeModal === 'transaksi'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setActiveModal('transaksi')
            }
          >
            <div className="nav-icon-wrapper">
              <FiDollarSign className="nav-icon" />
            </div>

            <span>Transaksi</span>
          </div>

          {/* ABSENSI */}
          <div
            className={`nav-item ${
              isActive('/ladies/absensi')
                ? 'active'
                : ''
            }`}
            onClick={() => {
              navigate('/ladies/absensi');
              closeModal();
            }}
          >
            <div className="nav-icon-wrapper">
              <FiCalendar className="nav-icon" />
            </div>

            <span>Absensi</span>
          </div>

          {/* MENU */}
          <div
            className={`nav-item ${
              activeModal === 'menu'
                ? 'active'
                : ''
            }`}
            onClick={() => setActiveModal('menu')}
          >
            <div className="nav-icon-wrapper">
              <FiUser className="nav-icon" />
            </div>

            <span>Menu</span>
          </div>
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