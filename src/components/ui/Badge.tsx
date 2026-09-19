import type { ReactNode } from 'react';
import type { VarianStatus } from '../../lib/statusMap';

type Props = {
  variant?: VarianStatus;
  children: ReactNode;
};

/* Setiap varian: latar lembut + border + teks berwarna. Border-nya penting —
   di tema gelap, pil tanpa border hampir menyatu dengan permukaan kartu. */
const VARIAN: Record<VarianStatus, string> = {
  success: 'bg-success-bg text-success-fg border-success-line',
  warning: 'bg-warning-bg text-warning-fg border-warning-line',
  danger: 'bg-danger-bg text-danger-fg border-danger-line',
  brand: 'bg-brand-subtle text-brand-fg border-brand-subtle',
  neutral: 'bg-subtle text-fg-muted border-line',
};

/** Pil status. Pemetaan nilai mentah ke varian ada di `src/lib/statusMap.ts` —
    komponen ini sengaja tidak tahu apa-apa soal nilai database. */
const Badge = ({ variant = 'neutral', children }: Props) => (
  <span
    className={[
      'inline-flex items-center rounded-full border',
      'px-2 py-0.5 text-xs font-medium whitespace-nowrap',
      VARIAN[variant],
    ].join(' ')}
  >
    {children}
  </span>
);

export default Badge;
