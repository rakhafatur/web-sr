import { ReactNode } from 'react';

type Variant = 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
type Size = 'md' | 'lg';

type Props = {
  variant: Variant;
  onClick?: () => void;
  icon?: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit';
  size?: Size;
  fullWidth?: boolean;
};

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, var(--color-green), var(--color-accent))',
    color: 'white',
    boxShadow: '0 10px 25px rgba(var(--color-primary-rgb),0.35)',
    fontWeight: 700,
  },
  success: {
    background: 'linear-gradient(135deg, var(--color-success), #15803d)',
    color: 'white',
    boxShadow: '0 10px 25px rgba(var(--color-success-rgb),0.3)',
    fontWeight: 700,
  },
  warning: {
    background: 'linear-gradient(135deg, var(--color-warning-solid), #c9820f)',
    color: 'white',
    boxShadow: '0 10px 25px rgba(var(--color-warning-solid-rgb),0.3)',
    fontWeight: 700,
  },
  danger: {
    background: 'linear-gradient(135deg, var(--color-danger-solid), #b91c1c)',
    color: 'white',
    boxShadow: '0 10px 25px rgba(var(--color-danger-solid-rgb),0.3)',
    fontWeight: 700,
  },
  secondary: {
    background: 'var(--color-surface-2)',
    color: 'var(--color-gray-700)',
    fontWeight: 600,
  },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  lg: { height: 48, borderRadius: 14, paddingInline: 22 },
  md: { height: 36, borderRadius: 10, paddingInline: 16, fontSize: '0.9rem' },
};

/** Tombol "kaya" (gradient + shadow) yang jadi standar semua CTA/modal/form-submit di app. */
const Button = ({ variant, onClick, icon, children, disabled, type = 'button', size = 'lg', fullWidth }: Props) => (
  <button
    type={type}
    className="btn d-flex align-items-center justify-content-center gap-2"
    onClick={onClick}
    disabled={disabled}
    style={{
      border: 'none',
      width: fullWidth ? '100%' : undefined,
      ...sizeStyles[size],
      ...variantStyles[variant],
    }}
  >
    {icon}
    {children}
  </button>
);

export default Button;
