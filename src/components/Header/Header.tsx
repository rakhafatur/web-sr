import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  useAuth,
} from '../../context/AuthContext';

import {
  supabase,
} from '../../lib/supabaseClient';

import {
  FiChevronDown,
  FiLogOut,
  FiShield,
} from 'react-icons/fi';

import './Header.css';

function Header() {
  const { logout, user } = useAuth();

  const navigate = useNavigate();

  const [displayName, setDisplayName] =
    useState('');

  const [groupName, setGroupName] =
    useState('');

  const [menuOpen, setMenuOpen] =
    useState(false);

  const dropdownRef =
    useRef<HTMLDivElement>(null);

  // =========================================================
  // FETCH USER
  // =========================================================
  useEffect(() => {
    const fetchDisplayName = async () => {
      if (!user) return;

      const { data: group } = await supabase
        .from('user_group')
        .select('group_name')
        .eq('id', user.user_group_id)
        .single();

      if (!group) return;

      const role =
        group.group_name.toLowerCase();

      setGroupName(group.group_name);

      if (role === 'ladies') {
        const { data } = await supabase
          .from('ladies')
          .select('nama_ladies')
          .eq('id', user.ladies_id)
          .single();

        setDisplayName(
          data?.nama_ladies ||
            user.nama ||
            'User'
        );
      } else if (role === 'pengawas') {
        const { data } = await supabase
          .from('pengawas')
          .select('nama_panggilan')
          .eq('id', user.pengawas_id)
          .single();

        setDisplayName(
          data?.nama_panggilan ||
            user.nama ||
            'User'
        );
      } else {
        setDisplayName(
          user.nama || 'User'
        );
      }
    };

    fetchDisplayName();
  }, [user]);

  // =========================================================
  // CLOSE OUTSIDE
  // =========================================================
  useEffect(() => {
    const handleClickOutside = (
      e: MouseEvent
    ) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          e.target as Node
        )
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
  }, []);

  // =========================================================
  // LOGOUT
  // =========================================================
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // =========================================================
  // INITIAL
  // =========================================================
  const getInitial = () =>
    displayName
      ?.charAt(0)
      ?.toUpperCase() || '?';

  return (
    <header className="header">
      {/* LEFT */}
      <div className="header-left">
        <div className="app-logo">
          SR
        </div>

        <div>
          <h1 className="app-title">
            SR Agency
          </h1>

          <div className="app-subtitle">
            Management System
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div
        className="header-right"
        ref={dropdownRef}
      >
        <div className="user-meta">
          <div className="user-greeting">
            Hi, {displayName}
          </div>

          <div className="user-role">
            <FiShield size={11} />
            {groupName || 'User'}
          </div>
        </div>

        <div
          className={`avatar-wrapper ${
            menuOpen ? 'active' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();

            setMenuOpen(
              (prev) => !prev
            );
          }}
        >
          <div className="avatar-circle">
            {getInitial()}
          </div>

          <FiChevronDown
            className={`avatar-chevron ${
              menuOpen ? 'rotate' : ''
            }`}
          />

          {/* DROPDOWN */}
          <div
            className={`dropdown-menu ${
              menuOpen ? 'show' : ''
            }`}
          >
            <div className="dropdown-user-info">
              <div className="dropdown-avatar">
                {getInitial()}
              </div>

              <div>
                <div className="dropdown-name">
                  {displayName}
                </div>

                <div className="dropdown-role">
                  {groupName}
                </div>
              </div>
            </div>

            <div className="dropdown-divider" />

            <button
              onClick={handleLogout}
              className="dropdown-item logout"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;