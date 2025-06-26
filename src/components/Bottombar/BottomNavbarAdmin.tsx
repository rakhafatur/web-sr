import { FiHome, FiUsers, FiDollarSign, FiMenu } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './BottomNavbar.css';

function BottomNavbarAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<'data' | 'transaksi' | 'menu' | null>(null);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Bottom Navbar */}
      <div className="bottom-navbar">
        <div className="nav-item" onClick={() => navigate('/')}>
          <FiHome className={`nav-icon ${isActive('/') ? 'active' : ''}`} />
          <span>Home</span>
        </div>

        <div className="nav-item" onClick={() => setActiveModal('data')}>
          <FiUsers className="nav-icon" />
          <span>Data</span>
        </div>

        <div className="nav-item" onClick={() => setActiveModal('transaksi')}>
          <FiDollarSign className="nav-icon" />
          <span>Transaksi</span>
        </div>

        <div className="nav-item" onClick={() => setActiveModal('menu')}>
          <FiMenu className="nav-icon" />
          <span>Menu</span>
        </div>
      </div>

      {/* Drawer / Modal */}
      {activeModal && (
        <div className="bottom-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="bottom-modal" onClick={(e) => e.stopPropagation()}>
            <h6 className="modal-title">{activeModal === 'data' ? 'Data' : activeModal === 'transaksi' ? 'Transaksi' : 'Menu'}</h6>
            <ul>
              {activeModal === 'data' && (
                <>
                  <li onClick={() => { navigate('/users'); setActiveModal(null); }}>Users</li>
                  <li onClick={() => { navigate('/pengawas'); setActiveModal(null); }}>Pengawas</li>
                  <li onClick={() => { navigate('/ladies'); setActiveModal(null); }}>Ladies</li>
                </>
              )}
              {activeModal === 'transaksi' && (
                <>
                  <li onClick={() => { navigate('/absensi'); setActiveModal(null); }}>Absensi</li>
                  <li onClick={() => { navigate('/rekap-voucher'); setActiveModal(null); }}>Rekap Voucher</li>
                  <li onClick={() => { navigate('/performa-ladies'); setActiveModal(null); }}>Performa Ladies</li>
                </>
              )}
              {activeModal === 'menu' && (
                <>
                  <li onClick={() => { navigate('/settings'); setActiveModal(null); }}>Settings</li>
                  <li onClick={() => { navigate('/logout'); setActiveModal(null); }}>Logout</li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

export default BottomNavbarAdmin;