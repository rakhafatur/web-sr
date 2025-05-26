import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className="d-flex justify-content-end align-items-center px-4 py-2"
      style={{
        background: 'linear-gradient(to right, #1b0036, #0f001e)', // 🌌 sama kayak sidebar
        backdropFilter: 'blur(10px)', // tetap mewah
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <button
        onClick={handleLogout}
        className="btn btn-sm btn-outline-warning fw-semibold"
      >
        🔓 Logout
      </button>
    </div>
  );
}

export default Header;