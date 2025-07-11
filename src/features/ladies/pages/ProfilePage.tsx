import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import './ProfilePage.css';
import {
  FiUser,
  FiSmartphone,
  FiCalendar,
  FiMapPin,
  FiCreditCard,
  FiKey,
  FiUserCheck
} from 'react-icons/fi';

type UserWithLadies = {
  id: string;
  username: string;
  nama: string;
  ladies_id: string;
  nama_ladies?: string;
  nama_lengkap?: string;
  nama_outlet?: string;
  nomor_ktp?: string;
  tanggal_bergabung?: string;
  alamat?: string;
  pin?: string;
  status?: string;
};

const ProfilePage = () => {
  const user = useSelector((state: RootState) => state.user.currentUser) as UserWithLadies;

  return (
    <div className="profile-page">
      <h2 className="profile-title">👩‍💼 Profil Saya</h2>

      <div className="profile-card">
        <div className="profile-row">
          <FiUser className="profile-icon" />
          <span>Nama Lengkap:</span>
          <strong>{user.nama_lengkap || '-'}</strong>
        </div>
        <div className="profile-row">
          <FiUserCheck className="profile-icon" />
          <span>Nama Ladies:</span>
          <strong>{user.nama_ladies || '-'}</strong>
        </div>
        <div className="profile-row">
          <FiMapPin className="profile-icon" />
          <span>Outlet:</span>
          <strong>{user.nama_outlet || '-'}</strong>
        </div>
        <div className="profile-row">
          <FiCreditCard className="profile-icon" />
          <span>No. KTP:</span>
          <strong>{user.nomor_ktp || '-'}</strong>
        </div>
        <div className="profile-row">
          <FiCalendar className="profile-icon" />
          <span>Tanggal Bergabung:</span>
          <strong>{user.tanggal_bergabung || '-'}</strong>
        </div>
        <div className="profile-row">
          <FiKey className="profile-icon" />
          <span>PIN:</span>
          <strong>{user.pin ? `****${user.pin.slice(-2)}` : '-'}</strong>
        </div>
        <div className="profile-row">
          <FiSmartphone className="profile-icon" />
          <span>Username:</span>
          <strong>{user.username || '-'}</strong>
        </div>
        <div className="profile-row">
          <FiUser className="profile-icon" />
          <span>Status:</span>
          <strong className={`status-badge ${user.status}`}>{user.status || '-'}</strong>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;