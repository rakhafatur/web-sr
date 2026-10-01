import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiKey,
  FiLogOut,
  FiMapPin,
  FiShield,
  FiSmartphone,
} from 'react-icons/fi';
import Skeleton from '../../../components/Skeleton';
import { confirmDialog } from '../../../components/ConfirmDialog';
import { useAuth } from '../../../context/AuthContext';
import LadiesPageBar from './LadiesPageBar';
import './LedgerPageMobile.css';
import './ProfileMobile.css';

type Props = {
  loading: boolean;
  nama?: string;
  outlet?: string;
  username?: string;
  pin?: string;
  statusLabel: string;
  /** Warna status dari STATUS_VARIANT_COLORS. */
  statusColors: { bg: string; text: string };
};

/**
 * Profil ladies versi mobile — selaras dengan halaman ladies lain: bar atas
 * sendiri, identitas di tengah (avatar inisial seperti Home), satu kartu
 * berkelompok untuk data akun, catatan keamanan, dan tombol Keluar.
 * PIN disembunyikan secara bawaan (bisa ditampilkan dengan tombol mata).
 */
const ProfileMobile = ({ loading, nama, outlet, username, pin, statusLabel, statusColors }: Props) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [pinTerlihat, setPinTerlihat] = useState(false);

  const handleLogout = async () => {
    if (!(await confirmDialog('Keluar dari akun ini?'))) return;
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="lp" role="status" aria-busy="true" aria-label="Memuat profil">
        <LadiesPageBar title="Profil" />
        <div className="pf-identity">
          <Skeleton width={88} height={88} borderRadius="var(--radius-full)" />
          <Skeleton width={160} height={24} style={{ marginTop: 14 }} />
          <Skeleton width={110} height={14} style={{ marginTop: 8 }} />
        </div>
        <div className="lp-stack">
          <Skeleton height={190} borderRadius="var(--radius-xl)" />
          <Skeleton height={80} borderRadius="var(--radius-xl)" />
        </div>
      </div>
    );
  }

  return (
    <div className="lp">
      <LadiesPageBar title="Profil" />

      {/* IDENTITAS */}
      <section className="pf-identity" aria-label="Identitas">
        <div className="pf-avatar" aria-hidden>
          {(nama || '?').charAt(0).toUpperCase()}
        </div>
        <h2 className="pf-name">{nama || '-'}</h2>
        {outlet && (
          <div className="pf-outlet">
            <FiMapPin aria-hidden />
            {outlet}
          </div>
        )}
        <span className="pf-status" style={{ background: statusColors.bg, color: statusColors.text }}>
          {statusLabel}
        </span>
      </section>

      <div className="lp-stack">
        {/* DATA AKUN */}
        <h3 className="lp-section-title pf-section-title">Akun</h3>
        <div className="lp-group">
          <div className="pf-row">
            <span className="pf-icon" aria-hidden><FiSmartphone /></span>
            <span className="pf-row-label">Username</span>
            <span className="pf-row-value">{username || '-'}</span>
          </div>

          <div className="pf-row">
            <span className="pf-icon" aria-hidden><FiKey /></span>
            <span className="pf-row-label">PIN</span>
            <span className="pf-row-value pf-pin">
              {pin ? (pinTerlihat ? pin : '•'.repeat(pin.length)) : '-'}
            </span>
            {pin && (
              <button
                type="button"
                className="pf-eye"
                onClick={() => setPinTerlihat((v) => !v)}
                aria-label={pinTerlihat ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
              >
                {pinTerlihat ? <FiEyeOff /> : <FiEye />}
              </button>
            )}
          </div>

          <div className="pf-row">
            <span className="pf-icon" aria-hidden><FiCheckCircle /></span>
            <span className="pf-row-label">Status akun</span>
            <span className="pf-row-value" style={{ color: statusColors.text }}>{statusLabel}</span>
          </div>
        </div>

        {/* KEAMANAN */}
        <div className="pf-note">
          <span className="pf-note-icon" aria-hidden><FiShield /></span>
          <div>
            <div className="pf-note-title">Keamanan akun</div>
            <div className="pf-note-text">
              Jangan bagikan PIN akun kepada siapa pun untuk menjaga keamanan data
              dan transaksi kamu.
            </div>
          </div>
        </div>

        {/* KELUAR */}
        <div className="lp-group">
          <button type="button" className="pf-row pf-logout" onClick={handleLogout}>
            <span className="pf-icon" aria-hidden><FiLogOut /></span>
            <span className="pf-row-label">Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileMobile;
