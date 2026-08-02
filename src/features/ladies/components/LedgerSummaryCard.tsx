import { ReactNode } from 'react';

type Props = {
  gradient: string;
  shadowColor: string;
  icon: ReactNode;
  label: string;
  value: ReactNode;
  /** Slot bebas di bawah value utama — bisa teks polos, atau (mis. Voucher) label + nominal kedua. */
  subtitle: ReactNode;
};

const LedgerSummaryCard = ({ gradient, shadowColor, icon, label, value, subtitle }: Props) => (
  <div
    style={{
      background: gradient,
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      color: '#fff',
      boxShadow: `0 6px 18px ${shadowColor}`,
    }}
  >
    <div className="d-flex align-items-center gap-2 mb-2">
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255,255,255,0.15)',
        }}
      >
        {icon}
      </div>

      <div>
        <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.9 }}>{label}</div>
        <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
      </div>
    </div>

    {subtitle}
  </div>
);

export default LedgerSummaryCard;
