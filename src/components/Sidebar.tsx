import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logosr.png';
import { FiHome, FiSettings, FiUsers, FiUserCheck, FiUser, FiCalendar, FiBook, FiPlus, FiDollarSign, FiBarChart2 } from 'react-icons/fi';

function Sidebar({
  isOpen,
  onClose,
  isMobile,
}: {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}) {
  const location = useLocation();
  const [showParameter, setShowParameter] = useState(false); // kontrol visibility submenu

  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = isOpen ? 'hidden' : '';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, isMobile]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Overlay untuk mobile */}
      {isOpen && (
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
          width: '250px',
          height: '100vh',
          overflowY: 'auto',
          background: 'linear-gradient(to bottom, #1b0036, #0f001e)',
          color: 'white',
          position: 'fixed',
          top: 0,
          left: isOpen ? 0 : '-250px',
          zIndex: 1000,
          transition: 'left 0.3s ease-in-out',
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
          <img src={logo} alt="SR Agency Logo" style={{ maxWidth: '120px', borderRadius: 12 }} />
        </div>

        <ul className="nav flex-column gap-2">
          <li className="nav-item">
            <Link
              to="/"
              onClick={isMobile ? onClose : undefined}
              className={`nav-link sidebar-link ${isActive('/') ? 'active' : ''}`}
            >
              <FiHome /> Home
            </Link>
          </li>

          <li className="nav-item">
            <div
              className="nav-link sidebar-link fw-bold"
              style={{ cursor: 'pointer' }}
              onClick={() => setShowParameter((prev) => !prev)}
            >
              <FiSettings /> Parameter ▾
            </div>

            {showParameter && (
              <ul className="nav flex-column ms-3">
                <li className="nav-item">
                  <Link
                    to="/users"
                    onClick={isMobile ? onClose : undefined}
                    className={`nav-link sidebar-link ${isActive('/users') ? 'active' : ''}`}
                  >
                    <FiUsers /> Users
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/pengawas"
                    onClick={isMobile ? onClose : undefined}
                    className={`nav-link sidebar-link ${isActive('/pengawas') ? 'active' : ''}`}
                  >
                    <FiUserCheck /> Pengawas
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/ladies"
                    onClick={isMobile ? onClose : undefined}
                    className={`nav-link sidebar-link ${isActive('/ladies') ? 'active' : ''}`}
                  >
                    <FiUser /> Ladies
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li className="nav-item">
            <Link
              to="/absensi"
              onClick={isMobile ? onClose : undefined}
              className={`nav-link sidebar-link ${isActive('/absensi') ? 'active' : ''}`}
            >
              <FiCalendar /> Absensi
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/buku-kuning"
              onClick={isMobile ? onClose : undefined}
              className={`nav-link sidebar-link ${isActive('/buku-kuning') ? 'active' : ''}`}
            >
              <FiBook /> Buku Kuning
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/add-transaksi"
              onClick={isMobile ? onClose : undefined}
              className={`nav-link sidebar-link ${isActive('/add-transaksi') ? 'active' : ''}`}
            >
              <FiPlus /> Add Transaksi
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/rekap-voucher"
              onClick={isMobile ? onClose : undefined}
              className={`nav-link sidebar-link ${isActive('/rekap-voucher') ? 'active' : ''}`}
            >
              <FiDollarSign /> Rekap Voucher
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/performa-ladies"
              onClick={isMobile ? onClose : undefined}
              className={`nav-link sidebar-link ${isActive('/performa-ladies') ? 'active' : ''}`}
            >
              <FiBarChart2 /> Performa Ladies
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Sidebar;