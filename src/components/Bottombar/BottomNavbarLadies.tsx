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
  const [activeModal, setActiveModal] = useState<'menu' | null>(null);

  // ✅ Menggunakan prefix match
  const isActive = (path: string) => location.pathname.startsWith(path);

  const renderModalContent = () => (
    <div className="bottom-modal-backdrop" onClick={() => setActiveModal(null)}>
      <div className="bottom-modal" onClick={(e) => e.stopPropagation()}>
        <h6 className="modal-title">Menu</h6>
        <ul>
          <li onClick={() => { navigate('/ladies/profile'); setActiveModal(null); }}>Profil</li>
          <li onClick={() => { navigate('/ladies/absensi'); setActiveModal(null); }}>Absensi</li>
          <li onClick={() => { navigate('/ladies/transaksi'); setActiveModal(null); }}>Riwayat Transaksi</li>
        </ul>
      </div>
    </div>
  );

  return (
    <>
      <div className="bottom-navbar">
        <div className="nav-item" onClick={() => { navigate('/ladies/home'); setActiveModal(null); }}>
          <FiHome className={`nav-icon ${isActive('/ladies/home') ? 'active' : ''}`} />
          <span>Home</span>
        </div>

        <div className="nav-item" onClick={() => { navigate('/ladies/transaksi'); setActiveModal(null); }}>
          <FiDollarSign className={`nav-icon ${isActive('/ladies/transaksi') ? 'active' : ''}`} />
          <span>Transaksi</span>
        </div>

        <div className="nav-item" onClick={() => { navigate('/ladies/absensi'); setActiveModal(null); }}>
          <FiCalendar className={`nav-icon ${isActive('/ladies/absensi') ? 'active' : ''}`} />
          <span>Absensi</span>
        </div>

        <div className="nav-item" onClick={() => setActiveModal('menu')}>
          <FiUser className={`nav-icon ${activeModal === 'menu' ? 'active' : ''}`} />
          <span>Profil</span>
        </div>
      </div>

      {activeModal && ReactDOM.createPortal(renderModalContent(), document.body)}
    </>
  );
}

export default BottomNavbarLadies;