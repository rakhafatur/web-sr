import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type VarianTombol = 'primary' | 'secondary' | 'ghost' | 'danger';
export type UkuranTombol = 'sm' | 'md' | 'lg';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'> & {
  variant?: VarianTombol;
  size?: UkuranTombol;
  /** Mengunci tombol dan menampilkan pemutar, label tetap terlihat. */
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
};

/* Nol gradient dan nol colored shadow — itu yang membuat versi lama terlihat
   seperti template. Penekanan datang dari warna isian, bukan dari efek. */
const VARIAN: Record<VarianTombol, string> = {
  primary: 'bg-brand text-fg-on-brand hover:bg-brand-hover',
  secondary: 'bg-surface text-fg border border-line-strong hover:bg-hover',
  ghost: 'text-fg-muted hover:bg-hover',
  danger: 'bg-danger-solid text-fg-on-brand hover:brightness-95',
};

/* Tinggi 44px di ukuran lg karena itu target sentuh minimum di mobile. */
const UKURAN: Record<UkuranTombol, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
  lg: 'h-11 px-4 text-base gap-2',
};

const DASAR = [
  'inline-flex items-center justify-center',
  'rounded-md font-medium whitespace-nowrap',
  'transition-colors duration-150',
  // Cincin fokus: proyek ini sebelumnya tidak punya satu pun aturan
  // :focus-visible, sehingga navigasi keyboard praktis tak terlihat.
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
  'disabled:opacity-50 disabled:pointer-events-none',
].join(' ');

/** Pemutar kecil untuk state loading. `aria-hidden` karena kesibukan sudah
    diumumkan lewat `aria-busy` pada tombolnya. */
const Pemutar = () => (
  <svg
    className="animate-spin size-4 shrink-0"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="8"
      cy="8"
      r="6.5"
      stroke="currentColor"
      strokeOpacity="0.25"
      strokeWidth="2"
    />
    <path
      d="M14.5 8A6.5 6.5 0 0 0 8 1.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const Button = ({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  children,
  disabled,
  type = 'button',
  ...sisanya
}: Props) => (
  <button
    {...sisanya}
    type={type}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={[DASAR, UKURAN[size], VARIAN[variant], fullWidth ? 'w-full' : ''].join(' ')}
  >
    {loading ? <Pemutar /> : icon}
    {children}
  </button>
);

export default Button;
