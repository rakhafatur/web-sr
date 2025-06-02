import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logosr.png';
import {
  FiHome,
  FiSettings,
  FiUsers,
  FiUserCheck,
  FiUser,
  FiCalendar,
  FiBook,
  FiPlus,
  FiDollarSign,
  FiBarChart2,
  FiChevronsLeft,
  FiChevronsRight,
} from 'react-icons/fi';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../constant';

function Sidebar({
  isOpen,
  onClose,
  isMobile,
  isCollapsed,
  onToggleCollapse,
}: {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const location = useLocation();
  const [showParameter, setShowParameter] = useState(false);

  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = isOpen ? 'hidden' : '';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, isMobile]);

  const isActive = (path: string) => location.pathname === path;

  const renderText = (text: string) => {
    return isCollapsed ? null : <span className="ms-2">{text}</span>;
  };

  return (
    <>
      {isOpen && isMobile && (
        <div
          onClick={onClose}
          className="d-md-none"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
        />
      )}

      <div
        className="d-flex flex-column p-3"
        style={{
          width: `${isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH}px`,
          height: '100vh',
          overflowY: 'auto',
          background: 'linear-gradient(to bottom, #1b0036, #0f001e)',
          color: 'white',
          position: 'fixed',
          top: 0,
          left: isMobile && !isOpen ? `-${SIDEBAR_WIDTH}px` : 0,
          zIndex: 1000,
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <div className="text-end d-md-none mb-2">
          <button
            onClick={onClose}
            style={{
              background: 'none',
              color: 'white',
              border: 'none',
              fontSize: '1.5rem',
            }}
          >
            ✕
          </button>
        </div>

        <div className="mb-4 text-center">
          <img
            src={logo}
            alt="SR Agency Logo"
            style={{
              maxWidth: isCollapsed ? '48px' : '120px',
              transition: 'max-width 0.3s',
              borderRadius: 12,
            }}
          />
        </div>

        {/* Collapse Button */}
        {!isMobile && (
          <div className="text-end mb-3">
            <button
              onClick={onToggleCollapse}
              className="btn btn-sm btn-outline-light"
              style={{ width: '100%' }}
            >
              {isCollapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
            </button>
          </div>
        )}

        <ul className="nav flex-column gap-2">
          <li className="nav-item">
            <Link to="/" onClick={isMobile ? onClose : undefined} className={`nav-link sidebar-link ${isActive('/') ? 'active' : ''}`}>
              <FiHome /> {renderText('Home')}
            </Link>
          </li>

          <li className="nav-item">
            <div
              className="nav-link sidebar-link fw-bold"
              style={{ cursor: 'pointer' }}
              onClick={() => setShowParameter((prev) => !prev)}
            >
              <FiSettings /> {renderText('Parameter ▾')}
            </div>

            {!isCollapsed && showParameter && (
              <ul className="nav flex-column ms-3">
                <li className="nav-item">
                  <Link to="/users" onClick={isMobile ? onClose : undefined} className={`nav-link sidebar-link ${isActive('/users') ? 'active' : ''}`}>
                    <FiUsers /> {renderText('Users')}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/pengawas" onClick={isMobile ? onClose : undefined} className={`nav-link sidebar-link ${isActive('/pengawas') ? 'active' : ''}`}>
                    <FiUserCheck /> {renderText('Pengawas')}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/ladies" onClick={isMobile ? onClose : undefined} className={`nav-link sidebar-link ${isActive('/ladies') ? 'active' : ''}`}>
                    <FiUser /> {renderText('Ladies')}
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li className="nav-item">
            <Link to="/absensi" onClick={isMobile ? onClose : undefined} className={`nav-link sidebar-link ${isActive('/absensi') ? 'active' : ''}`}>
              <FiCalendar /> {renderText('Absensi')}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/buku-kuning" onClick={isMobile ? onClose : undefined} className={`nav-link sidebar-link ${isActive('/buku-kuning') ? 'active' : ''}`}>
              <FiBook /> {renderText('Buku Kuning')}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/add-transaksi" onClick={isMobile ? onClose : undefined} className={`nav-link sidebar-link ${isActive('/add-transaksi') ? 'active' : ''}`}>
              <FiPlus /> {renderText('Add Transaksi')}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/rekap-voucher" onClick={isMobile ? onClose : undefined} className={`nav-link sidebar-link ${isActive('/rekap-voucher') ? 'active' : ''}`}>
              <FiDollarSign /> {renderText('Rekap Voucher')}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/performa-ladies" onClick={isMobile ? onClose : undefined} className={`nav-link sidebar-link ${isActive('/performa-ladies') ? 'active' : ''}`}>
              <FiBarChart2 /> {renderText('Performa Ladies')}
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Sidebar;
