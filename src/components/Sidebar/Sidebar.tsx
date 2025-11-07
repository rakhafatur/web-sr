import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logosr-green.png';
import {
  FiHome, FiSettings, FiUsers, FiUserCheck, FiUser,
  FiCalendar, FiBook, FiPlus, FiDollarSign, FiBarChart2,
  FiChevronsLeft, FiChevronsRight, FiChevronDown, FiChevronUp, FiFolder,
  FiCheckSquare,FiMessageSquare
} from 'react-icons/fi';

import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../../constant';
import './Sidebar.css';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
};

function Sidebar({
  isOpen,
  onClose,
  isMobile,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const location = useLocation();
  const [showParameter, setShowParameter] = useState(false);
  const [showTransaksiLadies, setShowTransaksiLadies] = useState(false);
  const [showTransaksiPengawas, setShowTransaksiPengawas] = useState(false);

  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = isOpen ? 'hidden' : '';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen, isMobile]);

  const isActive = (path: string) => location.pathname === path;
  const renderText = (text: string) => isCollapsed ? null : <span className="ms-2">{text}</span>;

  const labelTransaksiLadies = isMobile ? 'Trans. Ladies' : 'Transaksi Ladies';
  const labelTransaksiPengawas = isMobile ? 'Trans. Pengawas' : 'Transaksi Pengawas';

  return (
    <>
      {isOpen && isMobile && (
        <div className="sidebar-backdrop" onClick={onClose} />
      )}

      <div
        className="sidebar d-flex flex-column p-3"
        style={{
          width: `${isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH}px`,
          left: isMobile && !isOpen ? `-${SIDEBAR_WIDTH}px` : 0,
        }}
      >
        <div className="text-end d-md-none mb-2">
          <button className="btn-close-mobile" onClick={onClose}>✕</button>
        </div>

        <div className="mb-4 text-center">
          <img
            src={logo}
            alt="SR Agency Logo"
            className={`sidebar-logo ${isCollapsed ? 'collapsed' : ''}`}
            style={isMobile ? { maxWidth: 100, margin: '0 auto' } : {}}
          />
        </div>

        {!isMobile && (
          <div className="text-end mb-3">
            <button onClick={onToggleCollapse} className="btn btn-sm btn-outline-accent w-100">
              {isCollapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
            </button>
          </div>
        )}

        <ul className="nav flex-column gap-2">
          <li>
            <Link to="/" onClick={isMobile ? onClose : undefined} className={`nav-link sidebar-link ${isActive('/') ? 'active' : ''}`}>
              <FiHome className="sidebar-icon" /> {renderText('Home')}
            </Link>
          </li>

          {/* Parameter Section */}
          <li>
            <div
              className="nav-link sidebar-link fw-bold d-flex align-items-center justify-content-between"
              onClick={() => setShowParameter((p) => !p)}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <FiSettings className="sidebar-icon" /> {renderText('Parameter')}
              </div>
              {!isCollapsed && (
                showParameter ? <FiChevronUp className="ms-auto" /> : <FiChevronDown className="ms-auto" />
              )}
            </div>
            {!isCollapsed && showParameter && (
              <ul className="nav flex-column ms-3">
                <li>
                  <Link to="/users" onClick={isMobile ? onClose : undefined} className={`nav-link sidebar-link ${isActive('/users') ? 'active' : ''}`}>
                    <FiUsers className="sidebar-icon" /> {renderText('Users')}
                  </Link>
                </li>
                <li>
                  <Link to="/user-approval" onClick={isMobile ? onClose : undefined} className={`nav-link sidebar-link ${isActive('/user-approval') ? 'active' : ''}`}>
                    <FiCheckSquare className="sidebar-icon" /> {renderText('Approval User')}
                  </Link>
                </li>
                <li>
                  <Link to="/pengawas" onClick={isMobile ? onClose : undefined} className={`nav-link sidebar-link ${isActive('/pengawas') ? 'active' : ''}`}>
                    <FiUserCheck className="sidebar-icon" /> {renderText('Pengawas')}
                  </Link>
                </li>
                <li>
                  <Link to="/ladies" onClick={isMobile ? onClose : undefined} className={`nav-link sidebar-link ${isActive('/ladies') ? 'active' : ''}`}>
                    <FiUser className="sidebar-icon" /> {renderText('Ladies')}
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Transaksi Ladies */}
          <li>
            <div
              className="nav-link sidebar-link fw-bold d-flex align-items-center justify-content-between"
              onClick={() => setShowTransaksiLadies((p) => !p)}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <FiFolder className="sidebar-icon" /> {renderText(labelTransaksiLadies)}
              </div>
              {!isCollapsed && (
                showTransaksiLadies ? <FiChevronUp className="ms-auto" /> : <FiChevronDown className="ms-auto" />
              )}
            </div>
            {!isCollapsed && showTransaksiLadies && (
              <ul className="nav flex-column ms-3">
                <li>
                  <Link to="/add-transaksi" onClick={isMobile ? onClose : undefined} className={`nav-link sidebar-link ${isActive('/add-transaksi') ? 'active' : ''}`}>
                    <FiPlus className="sidebar-icon" /> {renderText('Add Transaksi')}
                  </Link>
                </li>
                <li>
                  <Link to="/buku-kuning" onClick={isMobile ? onClose : undefined} className={`nav-link sidebar-link ${isActive('/buku-kuning') ? 'active' : ''}`}>
                    <FiBook className="sidebar-icon" /> {renderText('Buku Kuning')}
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Transaksi Pengawas */}
          <li>
            <div
              className="nav-link sidebar-link fw-bold d-flex align-items-center justify-content-between"
              onClick={() => setShowTransaksiPengawas((p) => !p)}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <FiFolder className="sidebar-icon" /> {renderText(labelTransaksiPengawas)}
              </div>
              {!isCollapsed && (
                showTransaksiPengawas ? <FiChevronUp className="ms-auto" /> : <FiChevronDown className="ms-auto" />
              )}
            </div>
            {!isCollapsed && showTransaksiPengawas && (
              <ul className="nav flex-column ms-3">
                <li>
                  <Link to="/add-transaksi-pengawas" onClick={isMobile ? onClose : undefined} className={`nav-link sidebar-link ${isActive('/add-transaksi-pengawas') ? 'active' : ''}`}>
                    <FiPlus className="sidebar-icon" /> {renderText('Add Transaksi')}
                  </Link>
                </li>
                <li>
                  <Link to="/buku-kuning-pengawas" onClick={isMobile ? onClose : undefined} className={`nav-link sidebar-link ${isActive('/buku-kuning-pengawas') ? 'active' : ''}`}>
                    <FiBook className="sidebar-icon" /> {renderText('Buku Kuning')}
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Menu Lain */}
          <li>
            <Link to="/absensi" onClick={isMobile ? onClose : undefined} className={`nav-link sidebar-link ${isActive('/absensi') ? 'active' : ''}`}>
              <FiCalendar className="sidebar-icon" /> {renderText('Absensi')}
            </Link>
          </li>
          <li>
            <Link to="/rekap-voucher" onClick={isMobile ? onClose : undefined} className={`nav-link sidebar-link ${isActive('/rekap-voucher') ? 'active' : ''}`}>
              <FiDollarSign className="sidebar-icon" /> {renderText('Rekap Voucher')}
            </Link>
          </li>
          <li>
            <Link to="/performa-ladies" onClick={isMobile ? onClose : undefined} className={`nav-link sidebar-link ${isActive('/performa-ladies') ? 'active' : ''}`}>
              <FiBarChart2 className="sidebar-icon" /> {renderText('Performa Ladies')}
            </Link>
          </li>
          <li>
            <Link to="/smart-chat" onClick={isMobile ? onClose : undefined} className={`nav-link sidebar-link ${isActive('/smart-chat') ? 'active' : ''}`}>
              <FiMessageSquare className="sidebar-icon" /> {renderText('Smart Chat')}
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Sidebar;