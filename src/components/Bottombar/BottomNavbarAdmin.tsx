import {
  FiHome,
  FiDollarSign,
  FiBarChart2,
  FiMenu
} from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import './BottomNavbar.css';

function BottomNavbarAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<'transaksi' | 'report' | 'menu' | null>(null);

  const isActive = (path: string) => location.pathname === path;

  const renderModalContent = () => (
    <div className="bottom-modal-backdrop" onClick={() => setActiveModal(null)}>
      <div className="bottom-modal" onClick={(e) => e.stopPropagation()}>
        <h6 className="modal-title">
          {activeModal === 'transaksi' ? 'Transaksi' : activeModal === 'report' ? 'Laporan' : 'Menu'}
        </h6>
        <ul>
          {activeModal === 'transaksi' && (
            <>
              <li className="drawer-section">Ladies</li>
              <li onClick={() => { navigate('/add-transaksi'); setActiveModal(null); }}>Transaksi</li>
              <li onClick={() => { navigate('/buku-kuning'); setActiveModal(null); }}>Buku Kuning</li>

              <li className="drawer-section">Pengawas</li>
              <li onClick={() => { navigate('/add-transaksi-pengawas'); setActiveModal(null); }}>Transaksi</li>
              <li onClick={() => { navigate('/buku-kuning-pengawas'); setActiveModal(null); }}>Buku Kuning</li>
            </>
          )}

          {activeModal === 'report' && (
            <>
              <li onClick={() => { navigate('/absensi'); setActiveModal(null); }}>Absensi</li>
              <li onClick={() => { navigate('/rekap-voucher'); setActiveModal(null); }}>Rekap Voucher</li>
              <li onClick={() => { navigate('/performa-ladies'); setActiveModal(null); }}>Performa Ladies</li>
            </>
          )}

          {activeModal === 'menu' && (
            <>
              <li className="drawer-section">Parameter</li>
              <li onClick={() => { navigate('/users'); setActiveModal(null); }}>Users</li>
              <li onClick={() => { navigate('/user-approval'); setActiveModal(null); }}>Approval User</li> {/* ✅ Tambahan ini */}
              <li onClick={() => { navigate('/pengawas'); setActiveModal(null); }}>Pengawas</li>
              <li onClick={() => { navigate('/ladies'); setActiveModal(null); }}>Ladies</li>
              <li onClick={() => { navigate('/smart-chat'); setActiveModal(null); }}>Chat SR</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      <div className="bottom-navbar">
        <div className="nav-item" onClick={() => { navigate('/'); setActiveModal(null); }}>
          <FiHome className={`nav-icon ${isActive('/') ? 'active' : ''}`} />
          <span>Home</span>
        </div>

        <div className="nav-item" onClick={() => setActiveModal('transaksi')}>
          <FiDollarSign className={`nav-icon ${activeModal === 'transaksi' ? 'active' : ''}`} />
          <span>Transaksi</span>
        </div>

        <div className="nav-item" onClick={() => setActiveModal('report')}>
          <FiBarChart2 className={`nav-icon ${activeModal === 'report' ? 'active' : ''}`} />
          <span>Report</span>
        </div>

        <div className="nav-item" onClick={() => setActiveModal('menu')}>
          <FiMenu className={`nav-icon ${activeModal === 'menu' ? 'active' : ''}`} />
          <span>Menu</span>
        </div>
      </div>

      {activeModal && ReactDOM.createPortal(renderModalContent(), document.body)}
    </>
  );
}

export default BottomNavbarAdmin;