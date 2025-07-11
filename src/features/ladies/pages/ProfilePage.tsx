import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { supabase } from '../../../lib/supabaseClient';
import './ProfilePage.css';
import {
  FiUserCheck,
  FiMapPin,
  FiKey,
  FiSmartphone,
  FiUser
} from 'react-icons/fi';

type UserWithLadies = {
  id: string;
  username: string;
  nama: string;
  ladies_id: string;
};

type LadiesData = {
  nama_ladies: string;
  nama_outlet: string;
  pin: string;
  status: string;
};

const ProfilePage = () => {
  const user = useSelector((state: RootState) => state.user.currentUser) as UserWithLadies;
  const [ladies, setLadies] = useState<LadiesData | null>(null);

  useEffect(() => {
    const fetchLadies = async () => {
      if (!user?.ladies_id) return;

      const { data, error } = await supabase
        .from('ladies')
        .select('nama_ladies, nama_outlet, pin, status')
        .eq('id', user.ladies_id)
        .single();

      if (!error) {
        setLadies(data);
      }
    };

    fetchLadies();
  }, [user?.ladies_id]);

  return (
    <div className="profile-page">
      <h2 className="profile-title">👩‍💼 Profil Saya</h2>

      <div className="profile-card">
        <div className="profile-row">
          <FiUserCheck className="profile-icon" />
          <span>Nama Ladies:</span>
          <strong>{ladies?.nama_ladies || '-'}</strong>
        </div>
        <div className="profile-row">
          <FiMapPin className="profile-icon" />
          <span>Outlet:</span>
          <strong>{ladies?.nama_outlet || '-'}</strong>
        </div>
        <div className="profile-row">
          <FiKey className="profile-icon" />
          <span>PIN:</span>
          <strong>{ladies?.pin ? `****${ladies.pin.slice(-2)}` : '-'}</strong>
        </div>
        <div className="profile-row">
          <FiSmartphone className="profile-icon" />
          <span>Username:</span>
          <strong>{user.username || '-'}</strong>
        </div>
        <div className="profile-row">
          <FiUser className="profile-icon" />
          <span>Status:</span>
          <strong className={`status-badge ${ladies?.status}`}>{ladies?.status || '-'}</strong>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;