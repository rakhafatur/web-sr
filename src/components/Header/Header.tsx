import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { FiChevronDown, FiLogOut } from 'react-icons/fi';
import './Header.css';

function Header() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      if (user.ladies_id) {
        const { data } = await supabase
          .from('ladies')
          .select('nama_ladies, foto')
          .eq('id', user.ladies_id)
          .single();
        if (data) {
          setDisplayName(data.nama_ladies.split(' ')[0]);
          setAvatarUrl(data.foto || '');
        }
      } else if (user.pengawas_id) {
        const { data } = await supabase
          .from('pengawas')
          .select('nama_panggilan, foto')
          .eq('id', user.pengawas_id)
          .single();
        if (data) {
          setDisplayName(data.nama_panggilan.split(' ')[0]);
          setAvatarUrl(data.foto || '');
        }
      } else {
        setDisplayName(user.nama?.split(' ')[0] || '');
        setAvatarUrl(user.foto || '');
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="header">
      <div className="header-left">
        <h1 className="app-title">SR Agency</h1>
      </div>

      <div className="header-right" ref={dropdownRef}>
        <div className="avatar-section" onClick={() => setShowDropdown(!showDropdown)}>
          <img
            src={avatarUrl || '/default-avatar.png'}
            alt="avatar"
            className="avatar-img"
          />
          <FiChevronDown className="dropdown-icon" />
        </div>

        {showDropdown && (
          <div className="dropdown-menu">
            <p className="dropdown-name">Hi, {displayName}!</p>
            <button className="dropdown-logout" onClick={handleLogout}>
              <FiLogOut /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;