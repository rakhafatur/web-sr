import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { supabase } from '../../../lib/supabaseClient';
import {
  FiMapPin,
  FiKey,
  FiSmartphone,
  FiUser,
  FiCheckCircle,
  FiShield,
} from 'react-icons/fi';
import logo from '../../../assets/logosr-blue.png';
import type { UserWithLadies } from '../../../types/user';
import ProfileHeroCard from '../../../components/ProfileHeroCard';
import InfoRow from '../../../components/InfoRow';
import { STATUS_VARIANT_COLORS, StatusVariant } from '../../../components/StatusBadge';

type LadiesData = {
  nama_ladies: string;
  nama_outlet: string;
  pin: string;
  status: string;
};

const getStatusInfo = (status?: string): { variant: StatusVariant; label: string } => {
  switch (status?.toUpperCase()) {
    case 'AKTIF':
      return { variant: 'success', label: 'Aktif' };
    case 'NONAKTIF':
      return { variant: 'danger', label: 'Nonaktif' };
    default:
      return { variant: 'neutral', label: status || '-' };
  }
};

const ProfilePage = () => {
  const user = useSelector(
    (state: RootState) => state.user.currentUser
  ) as UserWithLadies;

  const [ladies, setLadies] = useState<LadiesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLadies = async () => {
      if (!user?.ladies_id) return;

      setLoading(true);

      const { data, error } = await supabase
        .from('ladies')
        .select('nama_ladies, nama_outlet, pin, status')
        .eq('id', user.ladies_id)
        .single();

      if (!error) {
        setLadies(data);
      }

      setLoading(false);
    };

    fetchLadies();
  }, [user?.ladies_id]);

  const statusInfo = getStatusInfo(ladies?.status);
  const statusColors = STATUS_VARIANT_COLORS[statusInfo.variant];

  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: '70vh' }}
      >
        <img
          src={logo}
          alt="loading"
          style={{ width: 90, marginBottom: 14, animation: 'pulse 1.5s infinite' }}
        />
        <div style={{ fontSize: 14, color: '#666', fontWeight: 500 }}>
          Memuat profile...
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell d-flex flex-column gap-3" style={{ paddingBottom: 24, maxWidth: 560 }}>
      <ProfileHeroCard
        avatarIcon={<FiUser size={34} />}
        name={ladies?.nama_ladies || '-'}
        subtitleIcon={<FiMapPin size={13} />}
        subtitle={ladies?.nama_outlet}
        statusLabel={statusInfo.label}
      />

      <div className="d-flex flex-column gap-2">
        <InfoRow
          icon={<FiSmartphone size={18} />}
          label="Username"
          value={user.username || '-'}
          iconBg="var(--color-medical-soft)"
          iconColor="var(--color-medical)"
        />

        <InfoRow
          icon={<FiKey size={18} />}
          label="PIN"
          value={<span style={{ letterSpacing: 1 }}>{ladies?.pin || '-'}</span>}
          iconBg="var(--color-expense-soft)"
          iconColor="var(--color-expense)"
        />

        <InfoRow
          icon={<FiCheckCircle size={18} />}
          label="Status Account"
          value={statusInfo.label}
          iconBg={statusColors.bg}
          iconColor={statusColors.text}
          valueColor={statusColors.text}
        />
      </div>

      <div
        style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-gray-100)',
          borderRadius: 'var(--radius-lg)',
          padding: 16,
          marginTop: 2,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="d-flex align-items-center gap-2 mb-2">
          <FiShield size={16} color="var(--color-green)" />
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-gray-900)' }}>
            Keamanan Akun
          </div>
        </div>

        <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>
          Jangan bagikan PIN akun kepada siapapun untuk menjaga keamanan data dan
          transaksi kamu.
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
