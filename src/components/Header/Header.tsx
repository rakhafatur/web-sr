import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import './Header.css';

function Header() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchUserDisplayName = async () => {
      if (!user) return;

      if (user.ladies_id) {
        const { data } = await supabase
          .from('ladies')
          .select('nama_ladies, avatar_url')
          .eq('id', user.ladies_id)
          .single();
        setDisplayName(data?.nama_ladies || user.username);
        setAvatarUrl(data?.avatar_url || null);
      } else if (user.pengawas_id) {
        const { data } = await supabase
          .from('pengawas')
          .select('nama_panggilan, avatar_url')
          .eq('id', user.pengawas_id)
          .single();
        setDisplayName(data?.nama_panggilan || user.username);
        setAvatarUrl(data?.avatar_url || null);
      } else {
        setDisplayName(user.nama || user.username);
        setAvatarUrl(user.avatar_url || null);
      }
    };

    fetchUserDisplayName();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="header">
      <div className="header-left">
        <h1 className="app-title">SR Agency</h1>
      </div>

      <div className="header-right" ref={dropdownRef}>
        <div className="avatar-wrapper" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <img
            src={avatarUrl || '/default-avatar.png'}
            alt="avatar"
            className="avatar-img"
          />
        </div>

        {dropdownOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-name">Hi, {displayName?.split(' ')[0]}!</div>
            <button onClick={handleLogout} className="dropdown-logout">
              <FiLogOut /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;