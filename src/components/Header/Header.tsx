import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import './Header.css';

function Header() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    const fetchNama = async () => {
      if (!user) return;

      if (user.ladies_id) {
        const { data } = await supabase
          .from('ladies')
          .select('nama_ladies, avatar_url')
          .eq('id', user.ladies_id)
          .single();
        setDisplayName(data?.nama_ladies ?? user.username);
        setAvatarUrl(data?.avatar_url ?? null);
      } else if (user.pengawas_id) {
        const { data } = await supabase
          .from('pengawas')
          .select('nama_panggilan, avatar_url')
          .eq('id', user.pengawas_id)
          .single();
        setDisplayName(data?.nama_panggilan ?? user.username);
        setAvatarUrl(data?.avatar_url ?? null);
      } else {
        // admin atau user biasa
        setDisplayName(user.nama ?? user.username);
        setAvatarUrl(user.avatar_url ?? null);
      }
    };

    fetchNama();
  }, [user]);

  return (
    <div className="header">
      <div className="header-left">
        <h1 className="app-title">SR AGENT</h1>
      </div>

      <div className="header-right">
        <div className="avatar-container" onClick={toggleDropdown}>
          <img
            src={avatarUrl || '/default-avatar.png'}
            alt="Avatar"
            className="avatar-img"
          />
          {showDropdown && (
            <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
              <p className="dropdown-name">Hi, {displayName?.split(' ')[0]}!</p>
              <button onClick={handleLogout} className="dropdown-logout">
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