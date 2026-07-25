import { ReactNode } from 'react';

type Variant = 'primary' | 'warning' | 'secondary';

type Props = {
  variant: Variant;
  onClick: () => void;
  icon?: ReactNode;
  children: ReactNode;
  disabled?: boolean;
};

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg,#22c55e,#4ade80)',
    color: 'white',
    boxShadow: '0 10px 25px rgba(34,197,94,0.25)',
    fontWeight: 700,
    paddingInline: 22,
  },
  warning: {
    background: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
    color: 'white',
    boxShadow: '0 10px 25px rgba(245,158,11,0.25)',
    fontWeight: 700,
    paddingInline: 22,
  },
  secondary: {
    background: '#f1f5f9',
    color: '#334155',
    fontWeight: 600,
    paddingInline: 20,
  },
};

/** Tombol footer modal dengan gaya "kaya" (gradient + shadow) yang jadi standar semua modal fitur. */
const ModalButton = ({ variant, onClick, icon, children, disabled }: Props) => (
  <button
    type="button"
    className="btn d-flex align-items-center gap-2"
    onClick={onClick}
    disabled={disabled}
    style={{
      height: 48,
      borderRadius: 14,
      border: 'none',
      ...variantStyles[variant],
    }}
  >
    {icon}
    {children}
  </button>
);

export default ModalButton;
