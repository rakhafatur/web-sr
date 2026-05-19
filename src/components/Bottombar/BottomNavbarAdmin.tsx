import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {
  FiHome,
  FiDollarSign,
  FiBarChart2,
  FiMenu,
  FiUsers,
  FiUserCheck,
  FiClipboard,
  FiTrendingUp,
  FiMessageCircle,
  FiBookOpen,
  FiShield,
  FiActivity,
  FiChevronRight,
} from 'react-icons/fi';

import { useLocation, useNavigate } from 'react-router-dom';

import './BottomNavbar.css';

function BottomNavbarAdmin() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState<
    'transaksi' | 'report' | 'menu' | null
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

        {/* TITLE */}
        <div className="bottom-sheet-header">
          <div>
            <div className="bottom-sheet-title">
              {activeModal === 'transaksi'
                ? 'Transaksi'
                : activeModal === 'report'
                ? 'Laporan'
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
                Ladies
              </div>

              {renderMenuItem(
                <FiDollarSign />,
                'Transaksi Ladies',
                '/add-transaksi'
              )}

              {renderMenuItem(
                <FiBookOpen />,
                'Buku Kuning Ladies',
                '/buku-kuning'
              )}

              <div className="sheet-section-title">
                Pengawas
              </div>

              {renderMenuItem(
                <FiDollarSign />,
                'Transaksi Pengawas',
                '/add-transaksi-pengawas'
              )}

              {renderMenuItem(
                <FiBookOpen />,
                'Buku Kuning Pengawas',
                '/buku-kuning-pengawas'
              )}
            </>
          )}

          {activeModal === 'report' && (
            <>
              <div className="sheet-section-title">
                Statistik & Laporan
              </div>

              {renderMenuItem(
                <FiClipboard />,
                'Absensi',
                '/absensi'
              )}

              {renderMenuItem(
                <FiTrendingUp />,
                'Rekap Voucher',
                '/rekap-voucher'
              )}

              {renderMenuItem(
                <FiActivity />,
                'Performa Ladies',
                '/performa-ladies'
              )}
            </>
          )}

          {activeModal === 'menu' && (
            <>
              <div className="sheet-section-title">
                Parameter
              </div>

              {renderMenuItem(
                <FiUsers />,
                'Users',
                '/users'
              )}

              {renderMenuItem(
                <FiShield />,
                'Approval User',
                '/user-approval',
                'NEW'
              )}

              {renderMenuItem(
                <FiUserCheck />,
                'Pengawas',
                '/pengawas'
              )}

              {renderMenuItem(
                <FiUsers />,
                'Ladies',
                '/ladies'
              )}

              <div className="sheet-section-title">
                AI Assistant
              </div>

              {renderMenuItem(
                <FiMessageCircle />,
                'Chat SR',
                '/smart-chat'
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
              isActive('/') &&
              location.pathname === '/'
                ? 'active'
                : ''
            }`}
            onClick={() => {
              navigate('/');
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

          {/* REPORT */}
          <div
            className={`nav-item ${
              activeModal === 'report'
                ? 'active'
                : ''
            }`}
            onClick={() => setActiveModal('report')}
          >
            <div className="nav-icon-wrapper">
              <FiBarChart2 className="nav-icon" />
            </div>

            <span>Report</span>
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
              <FiMenu className="nav-icon" />
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

export default BottomNavbarAdmin;