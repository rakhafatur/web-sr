import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HEADER_HEIGHT } from '../constant';
import { FiLogOut, FiMenu } from 'react-icons/fi';

function Header() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    const sidebar = document.querySelector('.sidebar');
    sidebar?.classList.toggle('collapsed');
  };

  return (
    <div
      className="d-flex align-items-center px-4 py-2 justify-content-between"
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
      {/* Hamburger only in mobile */}
      <button
        onClick={toggleSidebar}
        className="d-md-none"
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '1.5rem',
        }}
      >
        <FiMenu />
      </button>

      {/* Logout always on the right */}
      <div className="ms-auto">
        <button
          onClick={handleLogout}
          className="btn btn-sm btn-outline-warning fw-semibold d-flex align-items-center gap-1"
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  );
}

export default Header;