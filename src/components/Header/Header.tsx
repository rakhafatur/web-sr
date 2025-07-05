import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string>('');
  const [initial, setInitial] = useState<string>('U');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchName = async () => {
      if (!user) return;
      const { data: groupData } = await supabase
        .from('user_group')
        .select('group_name')
        .eq('id', user.user_group_id)
        .single();

      const group = groupData?.group_name;

      if (group === 'ladies') {
        const { data } = await supabase
          .from('ladies')
          .select('nama_ladies')
          .eq('id', user.ladies_id)
          .single();
        setDisplayName(data?.nama_ladies || 'User');
        setInitial((data?.nama_ladies || 'U')[0].toUpperCase());
      } else if (group === 'pengawas') {
        const { data } = await supabase
          .from('pengawas')
          .select('nama_panggilan')
          .eq('id', user.pengawas_id)
          .single();
        setDisplayName(data?.nama_panggilan || 'User');
        setInitial((data?.nama_panggilan || 'U')[0].toUpperCase());
      } else {
        setDisplayName(user.nama || 'User');
        setInitial((user.nama || 'U')[0].toUpperCase());
      }
    };

    fetchName();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="header">
      <div className="header-left">
        <h1 className="app-title">SR Agency</h1>
      </div>

      <div className="header-right" ref={dropdownRef}>
        <span className="user-greeting">Hi, {displayName.split(' ')[0]}</span>
        <div
          className="avatar-wrapper"
          onClick={() => setShowDropdown((prev) => !prev)}
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="avatar" className="avatar-img" />
          ) : (
            <div className="avatar-fallback">{initial}</div>
          )}
        </div>

        {showDropdown && (
          <div className="dropdown-menu">
            <button onClick={handleLogout} className="dropdown-item">
              <FiLogOut /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;