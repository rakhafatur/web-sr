import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { FiLogOut } from 'react-icons/fi';
import './Header.css';

function Header() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDisplayName = async () => {
      if (!user) return;

      // Ambil group_name dari relasi user_group
      const { data: group, error: groupErr } = await supabase
        .from('user_group')
        .select('group_name')
        .eq('id', user.user_group_id)
        .single();

      if (groupErr || !group) return;
      setGroupName(group.group_name);

      // Ambil nama dari tabel sesuai grup
      if (group.group_name === 'ladies') {
        const { data } = await supabase
          .from('ladies')
          .select('nama_ladies')
          .eq('id', user.ladies_id)
          .single();
        setDisplayName(data?.nama_ladies || user.nama || 'User');
      } else if (group.group_name === 'pengawas') {
        const { data } = await supabase
          .from('pengawas')
          .select('nama_panggilan')
          .eq('id', user.pengawas_id)
          .single();
        setDisplayName(data?.nama_panggilan || user.nama || 'User');
      } else {
        setDisplayName(user.nama || 'User');
      }
    };

    fetchDisplayName();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitial = () => {
    return displayName?.charAt(0)?.toUpperCase() || '?';
  };

  return (
    <div className="header">
      <div className="header-left">
        <h1 className="app-title">SR Agency</h1>
      </div>

      <div className="header-right" ref={dropdownRef}>
        {displayName && <span className="user-greeting">Hi, {displayName}</span>}

        <div className="avatar-wrapper" onClick={() => setMenuOpen((prev) => !prev)}>
          <div className="avatar-circle">{getInitial()}</div>
          {menuOpen && (
            <div className="dropdown-menu">
              <button onClick={handleLogout} className="dropdown-item">
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