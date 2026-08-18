import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  FiHome,
  FiDollarSign,
  FiBarChart2,
  FiMenu,
  FiUsers,
  FiUser,
  FiUserCheck,
  FiClipboard,
  FiTrendingUp,
  FiMessageCircle,
  FiBookOpen,
  FiShield,
  FiActivity,
  FiBriefcase,
  FiMapPin,
  FiChevronRight,
} from 'react-icons/fi';

import { useLocation, useNavigate } from 'react-router-dom';

import './BottomNavbar.css';

type Tab = 'transaksi' | 'report' | 'menu';

/**
 * Rute yang dimiliki tiap tab. Dipakai untuk menyalakan penanda halaman aktif
 * dari URL: sebelumnya tab Transaksi/Report/Menu hanya menyala selama sheet-nya
 * masih terbuka, jadi begitu berpindah halaman tidak ada penanda apa pun dan
 * user kehilangan jejak posisinya.
 *
 * Ditulis lengkap per rute karena halaman Tambah & Detail memakai akhiran
 * (`/ladies-create`, `/ladies-detail/:id`), bukan sub-path — jadi mencocokkan
 * awalan `/ladies` saja tidak cukup.
 */
const RUTE_TAB: Record<Tab, string[]> = {
  transaksi: [
    '/add-transaksi',
    '/add-transaksi-pengawas',
    '/buku-kuning',
    '/buku-kuning-pengawas',
  ],
  report: ['/absensi', '/rekap-voucher', '/performa-ladies'],
  menu: [
    '/users',
    '/user-create',
    '/user-approval',
    '/user-detail',
    '/pengawas',
    '/pengawas-create',
    '/pengawas-detail',
    '/ladies',
    '/ladies-create',
    '/ladies-detail',
    '/agent',
    '/agent-create',
    '/agent-detail',
    '/outlet',
    '/smart-chat',
  ],
};

/**
 * Cocok kalau rutenya sama persis atau merupakan induk langsung — bukan sekadar
 * berawalan sama. Tanpa syarat itu `/smart-chat` akan ikut menyala di halaman
 * ladies `/smart-chat-ladies`.
 */
const cocok = (pathname: string, rute: string) =>
  pathname === rute || pathname.startsWith(`${rute}/`);

const tabDariRute = (pathname: string): Tab | null => {
  for (const [tab, daftar] of Object.entries(RUTE_TAB)) {
    if (daftar.some((rute) => cocok(pathname, rute))) return tab as Tab;
  }
  return null;
};

function BottomNavbarAdmin() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState<Tab | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);

  const tabAktif = tabDariRute(location.pathname);
  const diHome = location.pathname === '/';

  // Selama sheet terbuka, tab itulah yang menyala; kalau tidak, URL yang menentukan.
  const menyala = (tab: Tab) =>
    activeModal ? activeModal === tab : tabAktif === tab;

  const closeModal = () => {
    setActiveModal(null);
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
    const title =
      activeModal === 'transaksi'
        ? 'Transaksi'
        : activeModal === 'report'
        ? 'Laporan'
        : 'Menu';

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

        {/* TITLE */}
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
              )}

              {renderMenuItem(
                <FiUserCheck />,
                'Pengawas',
                '/pengawas'
              )}

              {renderMenuItem(
                <FiUser />,
                'Ladies',
                '/ladies'
              )}

              {renderMenuItem(
                <FiBriefcase />,
                'Agent',
                '/agent'
              )}

              {renderMenuItem(
                <FiMapPin />,
                'Outlet',
                '/outlet'
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
  };

  return (
    <>
      <div className="bottom-navbar-wrapper">
        <div className="bottom-navbar">
          {/* HOME */}
          <button
            type="button"
            className={`nav-item ${
              !activeModal && diHome ? 'active' : ''
            }`}
            aria-label="Home"
            aria-current={diHome ? 'page' : undefined}
            onClick={() => {
              navigate('/');
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

          {/* REPORT */}
          <button
            type="button"
            className={`nav-item ${
              menyala('report') ? 'active' : ''
            }`}
            aria-label="Report"
            aria-expanded={activeModal === 'report'}
            aria-current={tabAktif === 'report' ? 'page' : undefined}
            onClick={() => setActiveModal('report')}
          >
            <div className="nav-icon-wrapper">
              <FiBarChart2 className="nav-icon" />
            </div>

            <span>Report</span>
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
              <FiMenu className="nav-icon" />
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

export default BottomNavbarAdmin;