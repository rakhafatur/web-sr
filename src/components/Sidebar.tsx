import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logosr.png';

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
      {/* Overlay belakang untuk mobile */}
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

      {/* Sidebar utama */}
      <div
        className="d-flex flex-column p-3"
        style={{
          width: '250px',
          height: '100vh', // fix: agar tidak lebih dari layar
          overflowY: 'auto', // fix: agar bisa discroll
          background: 'linear-gradient(to bottom, #1b0036, #0f001e)',
          color: 'white',
          position: 'fixed',
          top: 0,
          left: isOpen ? 0 : '-250px',
          zIndex: 1000,
          transition: 'left 0.3s ease-in-out',
        }}
      >
        {/* Tombol close (hanya muncul di mobile) */}
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

        {/* Logo */}
        <div className="mb-4 text-center">
          <img src={logo} alt="SR Agency Logo" style={{ maxWidth: '120px', borderRadius: 12 }} />
        </div>

        {/* Menu */}
        <ul className="nav flex-column gap-2">
          <li className="nav-item">
            <Link
              to="/"
              onClick={isMobile ? onClose : undefined}
              className={`nav-link sidebar-link ${isActive('/') ? 'active' : ''}`}
            >
              🏠 Home
            </Link>
          </li>

          <li className="nav-item">
            <div
              className="nav-link sidebar-link fw-bold"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                const el = document.getElementById('param-submenu');
                if (el) el.classList.toggle('d-none');
              }}
            >
              ⚙️ Parameter ▾
            </div>

            <ul id="param-submenu" className="nav flex-column ms-3">
              <li className="nav-item">
                <Link
                  to="/users"
                  onClick={isMobile ? onClose : undefined}
                  className={`nav-link sidebar-link ${isActive('/users') ? 'active' : ''}`}
                >
                  👥 Users
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/pengawas"
                  onClick={isMobile ? onClose : undefined}
                  className={`nav-link sidebar-link ${isActive('/pengawas') ? 'active' : ''}`}
                >
                  🧑‍💼 Pengawas
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/ladies"
                  onClick={isMobile ? onClose : undefined}
                  className={`nav-link sidebar-link ${isActive('/ladies') ? 'active' : ''}`}
                >
                  💃 Ladies
                </Link>
              </li>
            </ul>
          </li>

          <li className="nav-item">
            <Link
              to="/absensi"
              onClick={isMobile ? onClose : undefined}
              className={`nav-link sidebar-link ${isActive('/absensi') ? 'active' : ''}`}
            >
              🗓️ Absensi
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/buku-kuning"
              onClick={isMobile ? onClose : undefined}
              className={`nav-link sidebar-link ${isActive('/buku-kuning') ? 'active' : ''}`}
            >
              📒 Buku Kuning
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/add-transaksi"
              onClick={isMobile ? onClose : undefined}
              className={`nav-link sidebar-link ${isActive('/add-transaksi') ? 'active' : ''}`}
            >
              ➕ Add Transaksi
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/rekap-voucher"
              onClick={isMobile ? onClose : undefined}
              className={`nav-link sidebar-link ${isActive('/rekap-voucher') ? 'active' : ''}`}
            >
              💰 Rekap Voucher
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/performa-ladies"
              onClick={isMobile ? onClose : undefined}
              className={`nav-link sidebar-link ${isActive('/performa-ladies') ? 'active' : ''}`}
            >
              📊 Performa Ladies
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Sidebar;