import { ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
};

/** Kartu ringkasan di bawah header (intro generik saat Create, data entitas saat Detail). */
const EntityHeroCard = ({ icon, title, subtitle }: Props) => (
  <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ overflow: 'hidden' }}>
    <div className="p-4">
      <div className="d-flex align-items-center gap-3">
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: 'var(--radius-lg)',
            background: 'var(--color-green-lighter)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-green)',
            fontSize: 26,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div>
          <div className="fw-bold" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-dark)' }}>
            {title}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)', marginTop: 2 }}>{subtitle}</div>
        </div>
      </div>
    </div>
  </div>
);

export default EntityHeroCard;
