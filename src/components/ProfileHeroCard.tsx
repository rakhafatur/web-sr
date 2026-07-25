import { ReactNode } from 'react';
import Avatar from './Avatar';
import StatusBadge from './StatusBadge';

type Props = {
  avatarIcon: ReactNode;
  name: ReactNode;
  subtitle?: ReactNode;
  subtitleIcon?: ReactNode;
  statusLabel?: string;
};

/** Hero berwarna untuk halaman profil entitas (avatar + nama + status), dipakai di atas var(--color-green)/accent — bukan warna hijau bebas per halaman. */
const ProfileHeroCard = ({ avatarIcon, name, subtitle, subtitleIcon, statusLabel }: Props) => (
  <div
    style={{
      background: 'linear-gradient(135deg, var(--color-green), var(--color-accent))',
      borderRadius: 'var(--radius-xl)',
      padding: '24px 20px',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-brand)',
    }}
  >
    <div
      style={{
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
        top: -60,
        right: -60,
      }}
    />

    <div
      className="d-flex flex-column align-items-center text-center"
      style={{ position: 'relative', zIndex: 2 }}
    >
      <div style={{ marginBottom: 14 }}>
        <Avatar icon={avatarIcon} size="xl" tone="light" />
      </div>

      <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>{name}</div>

      {subtitle && (
        <div
          className="d-flex align-items-center gap-1"
          style={{ marginTop: 6, fontSize: 13, opacity: 0.92 }}
        >
          {subtitleIcon}
          {subtitle}
        </div>
      )}

      {statusLabel && (
        <div style={{ marginTop: 16 }}>
          <StatusBadge label={statusLabel} tone="onDark" />
        </div>
      )}
    </div>
  </div>
);

export default ProfileHeroCard;
