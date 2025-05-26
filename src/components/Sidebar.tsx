import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logosr.png';

function Sidebar() {
  const location = useLocation();
  const [showParameterMenu, setShowParameterMenu] = useState(true);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      className="d-flex flex-column p-3"
      style={{
        width: '250px',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #1b0036, #0f001e)',
        color: 'white',
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div className="mb-4 text-center">
        <img src={logo} alt="SR Agency Logo" style={{ maxWidth: '120px', borderRadius: 12 }} />
      </div>

      {/* Menu utama */}
      <ul className="nav flex-column gap-2">
        <li className="nav-item">
          <Link to="/" className={`nav-link sidebar-link ${isActive('/') ? 'active' : ''}`}>
            🏠 Home
          </Link>
        </li>

        <li className="nav-item">
          <div
            className="nav-link sidebar-link fw-bold"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowParameterMenu(!showParameterMenu)}
          >
            ⚙️ Parameter {showParameterMenu ? '▾' : '▸'}
          </div>

          {showParameterMenu && (
            <ul className="nav flex-column ms-3">
              <li className="nav-item">
                <Link
                  to="/users"
                  className={`nav-link sidebar-link ${isActive('/users') ? 'active' : ''}`}
                >
                  👥 Users
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/pengawas"
                  className={`nav-link sidebar-link ${isActive('/pengawas') ? 'active' : ''}`}
                >
                  🧑‍💼 Pengawas
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/ladies"
                  className={`nav-link sidebar-link ${isActive('/ladies') ? 'active' : ''}`}
                >
                  💃 Ladies
                </Link>
              </li>
            </ul>
          )}
        </li>

        <li className="nav-item">
          <Link
            to="/absensi"
            className={`nav-link sidebar-link ${isActive('/absensi') ? 'active' : ''}`}
          >
            🗓️ Absensi
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/buku-kuning"
            className={`nav-link sidebar-link ${isActive('/buku-kuning') ? 'active' : ''}`}
          >
            📒 Buku Kuning
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/add-transaksi"
            className={`nav-link sidebar-link ${isActive('/add-transaksi') ? 'active' : ''}`}
          >
            ➕ Add Transaksi
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/rekap-voucher"
            className={`nav-link sidebar-link ${isActive('/rekap-voucher') ? 'active' : ''}`}
          >
            💰 Rekap Voucher
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/performa-ladies"
            className={`nav-link sidebar-link ${isActive('/performa-ladies') ? 'active' : ''}`}
          >
            📊 Performa Ladies
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;