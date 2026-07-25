export type StatusVariant = 'success' | 'warning' | 'danger' | 'neutral';

/** Diekspor supaya elemen lain (mis. InfoRow icon-box) bisa ikut warna variant yang sama persis dengan badge-nya. */
export const STATUS_VARIANT_COLORS: Record<StatusVariant, { bg: string; text: string }> = {
  success: { bg: 'var(--color-income-soft)', text: 'var(--color-income)' },
  warning: { bg: 'var(--color-voucher-soft)', text: 'var(--color-warning-solid)' },
  danger: { bg: 'var(--color-expense-soft)', text: 'var(--color-danger-solid)' },
  neutral: { bg: 'var(--color-gray-100)', text: 'var(--color-gray-700)' },
};
const VARIANT_STYLE = STATUS_VARIANT_COLORS;

type Props = {
  label: string;
  variant?: StatusVariant;
  /** onDark = pill putih translucent, dipakai di atas hero berwarna */
  tone?: 'soft' | 'onDark';
};

/** Pill status pusat — pemetaan status mentah ("AKTIF", dsb) ke variant tetap jadi tanggung jawab pemanggil. */
const StatusBadge = ({ label, variant = 'neutral', tone = 'soft' }: Props) => {
  const style =
    tone === 'onDark'
      ? { background: 'rgba(255,255,255,0.16)', color: '#fff', backdropFilter: 'blur(10px)' as const }
      : { background: VARIANT_STYLE[variant].bg, color: VARIANT_STYLE[variant].text };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: tone === 'onDark' ? '6px 14px' : '4px 12px',
        borderRadius: 'var(--radius-full)',
        fontSize: 12,
        fontWeight: 700,
        ...style,
      }}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
