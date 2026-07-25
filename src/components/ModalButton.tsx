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
    background: 'linear-gradient(135deg, var(--color-green), var(--color-accent))',
    color: 'white',
    boxShadow: '0 10px 25px rgba(var(--color-primary-rgb),0.35)',
    fontWeight: 700,
    paddingInline: 22,
  },
  warning: {
    background: 'linear-gradient(135deg, var(--color-warning-solid), #c9820f)',
    color: 'white',
    boxShadow: '0 10px 25px rgba(var(--color-warning-solid-rgb),0.3)',
    fontWeight: 700,
    paddingInline: 22,
  },
  secondary: {
    background: 'var(--color-surface-2)',
    color: 'var(--color-gray-700)',
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
