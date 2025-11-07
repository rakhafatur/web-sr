import {
  FiHome,
  FiDollarSign,
  FiCalendar,
  FiUser
} from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import './BottomNavbarLadies.css';

function BottomNavbarLadies() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<'menu' | 'transaksi' | null>(null);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const renderModalContent = () => {
    if (activeModal === 'transaksi') {
      return (
        <div className="bottom-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="bottom-modal" onClick={(e) => e.stopPropagation()}>
            <h6 className="modal-title">Transaksi</h6>
            <ul>
              <li onClick={() => { navigate('/ladies/voucher'); setActiveModal(null); }}>Voucher</li>
              <li onClick={() => { navigate('/ladies/kasbon'); setActiveModal(null); }}>Kasbon</li>
            </ul>
          </div>
        </div>
      );
    }

    if (activeModal === 'menu') {
      return (
        <div className="bottom-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="bottom-modal" onClick={(e) => e.stopPropagation()}>
            <h6 className="modal-title">Menu</h6>
            <ul>
              <li onClick={() => { navigate('/ladies/profile'); setActiveModal(null); }}>Profile</li>
              <li onClick={() => { navigate('/ladies/peraturan'); setActiveModal(null); }}>Peraturan</li>
              {/* <li onClick={() => { navigate('/smart-chat-ladies'); setActiveModal(null); }}>Chat SR</li> */}
            </ul>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div className="bottom-navbar">
        <div className="nav-item" onClick={() => { navigate('/ladies/home'); setActiveModal(null); }}>
          <FiHome className={`nav-icon ${isActive('/ladies/home') ? 'active' : ''}`} />
          <span>Home</span>
        </div>

        <div className="nav-item" onClick={() => setActiveModal('transaksi')}>
          <FiDollarSign className={`nav-icon ${activeModal === 'transaksi' ? 'active' : ''}`} />
          <span>Transaksi</span>
        </div>

        <div className="nav-item" onClick={() => { navigate('/ladies/absensi'); setActiveModal(null); }}>
          <FiCalendar className={`nav-icon ${isActive('/ladies/absensi') ? 'active' : ''}`} />
          <span>Absensi</span>
        </div>

        <div className="nav-item" onClick={() => setActiveModal('menu')}>
          <FiUser className={`nav-icon ${activeModal === 'menu' ? 'active' : ''}`} />
          <span>Menu</span>
        </div>
      </div>

      {activeModal && ReactDOM.createPortal(renderModalContent(), document.body)}
    </>
  );
}

export default BottomNavbarLadies;