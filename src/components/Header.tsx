import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HEADER_HEIGHT } from '../constant';
import { FiLogOut } from 'react-icons/fi';

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
        height: `${HEADER_HEIGHT}px`,
        background: 'linear-gradient(to right, #1b0036, #0f001e)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 900,
      }}
    >
      <button
        onClick={handleLogout}
        className="btn btn-sm btn-outline-warning fw-semibold d-flex align-items-center gap-1"
      >
        <FiLogOut /> Logout
      </button>
    </div>
  );
}

export default Header;