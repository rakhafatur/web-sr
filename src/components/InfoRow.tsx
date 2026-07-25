import { ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  iconBg?: string;
  iconColor?: string;
  valueColor?: string;
};

/** Baris "icon-box + label + value" — dulu di-copy-paste 3x per halaman entitas (Username/PIN/Status dsb). */
const InfoRow = ({
  icon,
  label,
  value,
  iconBg = 'var(--color-medical-soft)',
  iconColor = 'var(--color-medical)',
  valueColor = 'var(--color-gray-900)',
}: Props) => (
  <div
    className="d-flex align-items-center gap-3"
    style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-gray-100)',
      borderRadius: 'var(--radius-lg)',
      padding: '14px 16px',
      boxShadow: 'var(--shadow-sm)',
    }}
  >
    <div
      className="d-flex align-items-center justify-content-center flex-shrink-0"
      style={{
        width: 42,
        height: 42,
        borderRadius: 'var(--radius-md)',
        background: iconBg,
        color: iconColor,
      }}
    >
      {icon}
    </div>

    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, color: 'var(--color-gray-400)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: valueColor, marginTop: 2 }}>{value}</div>
    </div>
  </div>
);

export default InfoRow;
