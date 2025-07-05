import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { FiLogOut } from 'react-icons/fi';
import './Header.css';

function Header() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [initials, setInitials] = useState('');

  useEffect(() => {
    if (!user) return;

    // Role-based name handling
    if (user.role === 'ladies' && user.nama_ladies) {
      setDisplayName(user.nama_ladies);
      setInitials(user.nama_ladies[0]?.toUpperCase() || '');
    } else if (user.role === 'pengawas' && user.nama_panggilan) {
      setDisplayName(user.nama_panggilan);
      setInitials(user.nama_panggilan[0]?.toUpperCase() || '');
    } else if (user.nama) {
      setDisplayName(user.nama);
      setInitials(user.nama[0]?.toUpperCase() || '');
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
    <div className="header">
      <div className="header-left">
        <h1 className="app-title">SR Agency</h1>
      </div>

      <div className="header-right">
        {displayName && <span className="user-greeting">Hi, {displayName.split(' ')[0]}</span>}

        <div className="avatar-wrapper" onClick={toggleDropdown}>
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" className="avatar-img" />
          ) : (
            <div className="avatar-fallback">{initials}</div>
          )}

          {showDropdown && (
            <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
              <button className="dropdown-item" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;