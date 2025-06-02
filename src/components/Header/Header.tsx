import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut, FiMenu } from 'react-icons/fi';
import './Header.css';

type HeaderProps = {
  onToggleSidebar: () => void;
};

function Header({ onToggleSidebar }: HeaderProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="header">
      <button onClick={onToggleSidebar} className="hamburger d-md-none">
        <FiMenu />
      </button>
      <button onClick={handleLogout} className="logout-btn ms-auto">
        <FiLogOut /> Logout
      </button>
    </div>
  );
}

export default Header;
