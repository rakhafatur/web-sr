import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
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
import type { UserWithLadies } from '../../../types/user';
import Skeleton from '../../../components/Skeleton';
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

  const { data: ladies, isLoading: loading } = useQuery({
    queryKey: ['profile-ladies', user?.ladies_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ladies')
        .select('nama_ladies, nama_outlet, pin, status')
        .eq('id', user?.ladies_id as string)
        .single();

      if (error) throw error;

      return data as LadiesData;
    },
    enabled: !!user?.ladies_id,
    meta: { errorLabel: 'profile' },
  });

  const statusInfo = getStatusInfo(ladies?.status);
  const statusColors = STATUS_VARIANT_COLORS[statusInfo.variant];

  if (loading) {
    // Bentuknya mengikuti tata letak asli: kartu identitas, tiga baris info,
    // lalu kartu keamanan — jadi halaman tidak melompat saat data datang.
    return (
      <div
        className="page-shell d-flex flex-column gap-3"
        style={{ paddingBottom: 24, maxWidth: 560 }}
        role="status"
        aria-busy="true"
        aria-label="Memuat profile"
      >
        <Skeleton height={132} borderRadius="var(--radius-lg)" />

        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height={62} borderRadius="var(--radius-lg)" />
        ))}

        <Skeleton height={92} borderRadius="var(--radius-lg)" />
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

        <div style={{ fontSize: 12, color: 'var(--color-gray-500)', lineHeight: 1.6 }}>
          Jangan bagikan PIN akun kepada siapapun untuk menjaga keamanan data dan
          transaksi kamu.
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
