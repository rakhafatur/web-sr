import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut, FiMenu } from 'react-icons/fi';
import './Header.css';

type HeaderProps = {
  onToggleSidebar: () => void;
};

function Header({ onToggleSidebar }: HeaderProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="header">
      <div className="header-left d-flex align-items-center gap-3">
        <button onClick={onToggleSidebar} className="hamburger d-md-none">
          <FiMenu />
        </button>
      </div>

      <div className="header-right d-flex align-items-center gap-3">
        {user?.nama && (
          <span className="user-greeting text-muted">Hi, {user.nama.split(' ')[0]}</span>
        )}
        <button onClick={handleLogout} className="logout-btn">
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  );
}

export default Header;
