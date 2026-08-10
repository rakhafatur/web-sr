import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome, FiSettings, FiUsers, FiUserCheck, FiUser,
  FiCalendar, FiBook, FiPlus, FiDollarSign, FiBarChart2,
  FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp, FiFolder,
  FiCheckSquare,FiMessageSquare,
  FiBriefcase, FiMapPin
} from 'react-icons/fi';

import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../../constant';
import './Sidebar.css';

type SidebarProps = {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
};

function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const [showParameter, setShowParameter] = useState(false);
  const [showTransaksiLadies, setShowTransaksiLadies] = useState(false);
  const [showTransaksiPengawas, setShowTransaksiPengawas] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const renderText = (text: string) => isCollapsed ? null : <span className="ms-2">{text}</span>;

  return (
    <div
      className="sidebar d-flex flex-column p-3"
      style={{ width: `${isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH}px` }}
    >
      <button
        onClick={onToggleCollapse}
        className="sidebar-toggle-btn"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
      </button>

      <ul className="nav flex-column gap-2 sidebar-nav">
        <li>
          <Link to="/" className={`nav-link sidebar-link ${isActive('/') ? 'active' : ''}`}>
            <FiHome className="sidebar-icon" /> {renderText('Home')}
          </Link>
        </li>

        {/* Parameter Section */}
        <li>
          <div
            className="nav-link sidebar-link fw-bold d-flex align-items-center justify-content-between"
            role="button"
            tabIndex={0}
            aria-expanded={showParameter}
            aria-label="Parameter"
            onClick={() => setShowParameter((p) => !p)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowParameter((p) => !p);
              }
            }}
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
                <Link to="/users" className={`nav-link sidebar-link ${isActive('/users') ? 'active' : ''}`}>
                  <FiUsers className="sidebar-icon" /> {renderText('Users')}
                </Link>
              </li>
              <li>
                <Link to="/user-approval" className={`nav-link sidebar-link ${isActive('/user-approval') ? 'active' : ''}`}>
                  <FiCheckSquare className="sidebar-icon" /> {renderText('Approval User')}
                </Link>
              </li>
              <li>
                <Link to="/pengawas" className={`nav-link sidebar-link ${isActive('/pengawas') ? 'active' : ''}`}>
                  <FiUserCheck className="sidebar-icon" /> {renderText('Pengawas')}
                </Link>
              </li>
              <li>
                <Link to="/ladies" className={`nav-link sidebar-link ${isActive('/ladies') ? 'active' : ''}`}>
                  <FiUser className="sidebar-icon" /> {renderText('Ladies')}
                </Link>
              </li>
              <li>
                <Link to="/agent" className={`nav-link sidebar-link ${isActive('/agent') ? 'active' : ''}`}>
                  <FiBriefcase className="sidebar-icon" /> {renderText('Agent')}
                </Link>
              </li>
              <li>
                <Link to="/outlet" className={`nav-link sidebar-link ${isActive('/outlet') ? 'active' : ''}`}>
                  <FiMapPin className="sidebar-icon" /> {renderText('Outlet')}
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Transaksi Ladies */}
        <li>
          <div
            className="nav-link sidebar-link fw-bold d-flex align-items-center justify-content-between"
            role="button"
            tabIndex={0}
            aria-expanded={showTransaksiLadies}
            aria-label="Transaksi Ladies"
            onClick={() => setShowTransaksiLadies((p) => !p)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowTransaksiLadies((p) => !p);
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <div>
              <FiFolder className="sidebar-icon" /> {renderText('Transaksi Ladies')}
            </div>
            {!isCollapsed && (
              showTransaksiLadies ? <FiChevronUp className="ms-auto" /> : <FiChevronDown className="ms-auto" />
            )}
          </div>
          {!isCollapsed && showTransaksiLadies && (
            <ul className="nav flex-column ms-3">
              <li>
                <Link to="/add-transaksi" className={`nav-link sidebar-link ${isActive('/add-transaksi') ? 'active' : ''}`}>
                  <FiPlus className="sidebar-icon" /> {renderText('Add Transaksi')}
                </Link>
              </li>
              <li>
                <Link to="/buku-kuning" className={`nav-link sidebar-link ${isActive('/buku-kuning') ? 'active' : ''}`}>
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
            role="button"
            tabIndex={0}
            aria-expanded={showTransaksiPengawas}
            aria-label="Transaksi Pengawas"
            onClick={() => setShowTransaksiPengawas((p) => !p)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowTransaksiPengawas((p) => !p);
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <div>
              <FiFolder className="sidebar-icon" /> {renderText('Transaksi Pengawas')}
            </div>
            {!isCollapsed && (
              showTransaksiPengawas ? <FiChevronUp className="ms-auto" /> : <FiChevronDown className="ms-auto" />
            )}
          </div>
          {!isCollapsed && showTransaksiPengawas && (
            <ul className="nav flex-column ms-3">
              <li>
                <Link to="/add-transaksi-pengawas" className={`nav-link sidebar-link ${isActive('/add-transaksi-pengawas') ? 'active' : ''}`}>
                  <FiPlus className="sidebar-icon" /> {renderText('Add Transaksi')}
                </Link>
              </li>
              <li>
                <Link to="/buku-kuning-pengawas" className={`nav-link sidebar-link ${isActive('/buku-kuning-pengawas') ? 'active' : ''}`}>
                  <FiBook className="sidebar-icon" /> {renderText('Buku Kuning')}
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Menu Lain */}
        <li>
          <Link to="/absensi" className={`nav-link sidebar-link ${isActive('/absensi') ? 'active' : ''}`}>
            <FiCalendar className="sidebar-icon" /> {renderText('Absensi')}
          </Link>
        </li>
        <li>
          <Link to="/rekap-voucher" className={`nav-link sidebar-link ${isActive('/rekap-voucher') ? 'active' : ''}`}>
            <FiDollarSign className="sidebar-icon" /> {renderText('Rekap Voucher')}
          </Link>
        </li>
        <li>
          <Link to="/performa-ladies" className={`nav-link sidebar-link ${isActive('/performa-ladies') ? 'active' : ''}`}>
            <FiBarChart2 className="sidebar-icon" /> {renderText('Performa Ladies')}
          </Link>
        </li>
        <li>
          <Link to="/smart-chat" className={`nav-link sidebar-link ${isActive('/smart-chat') ? 'active' : ''}`}>
            <FiMessageSquare className="sidebar-icon" /> {renderText('Smart Chat')}
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
