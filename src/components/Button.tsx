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
  /** Override titik-titik gaya (mis. height) untuk kasus penyelarasan lokal — variant/size tetap sumber kebenaran warna & bentuk. */
  style?: React.CSSProperties;
};

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, var(--color-green), var(--color-accent))',
    color: 'white',
    boxShadow: '0 10px 25px rgba(var(--color-primary-rgb),0.35)',
    fontWeight: 700,
  },
  success: {
    background: 'linear-gradient(135deg, var(--color-success), var(--color-income-deep))',
    color: 'white',
    boxShadow: '0 10px 25px rgba(var(--color-success-rgb),0.3)',
    fontWeight: 700,
  },
  warning: {
    background: 'linear-gradient(135deg, var(--color-warning-solid), var(--color-voucher-deep))',
    color: 'white',
    boxShadow: '0 10px 25px rgba(var(--color-warning-solid-rgb),0.3)',
    fontWeight: 700,
  },
  danger: {
    background: 'linear-gradient(135deg, var(--color-danger-solid), var(--color-expense-deep))',
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
  lg: { height: 48, borderRadius: 'var(--radius-lg)', paddingInline: 'var(--space-6)' },
  md: { height: 36, borderRadius: 'var(--radius-md)', paddingInline: 'var(--space-4)', fontSize: 'var(--font-size-sm)' },
};

/** Tombol "kaya" (gradient + shadow) yang jadi standar semua CTA/modal/form-submit di app. */
const Button = ({ variant, onClick, icon, children, disabled, type = 'button', size = 'lg', fullWidth, style }: Props) => (
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
      ...style,
    }}
  >
    {icon}
    {children}
  </button>
);

export default Button;
