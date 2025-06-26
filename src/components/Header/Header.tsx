import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut } from 'react-icons/fi';
import './Header.css';

function Header() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="header">
      <div className="header-left">
        <h1 className="app-title">SR Agency</h1>
      </div>

      <div className="header-right">
        {user?.nama && (
          <span className="user-greeting">Hi, {user.nama.split(' ')[0]}</span>
        )}
        <button onClick={handleLogout} className="logout-btn">
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  );
}

export default Header;