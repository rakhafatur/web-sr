import { ReactNode } from 'react';
import { FiArrowLeft } from 'react-icons/fi';

type Props = {
  icon: ReactNode;
  title: string;
  description: string;
  onBack: () => void;
  actions?: ReactNode;
};

/** Banner atas halaman Tambah/Detail entitas (Agent/Pengawas/Ladies/User) — dipakai seragam di semua. */
const EntityPageHeader = ({ icon, title, description, onBack, actions }: Props) => (
  <div
    className="mb-4 p-4 rounded-4 shadow-sm position-relative overflow-hidden"
    style={{
      background: 'linear-gradient(135deg, var(--color-green), var(--color-accent))',
      color: 'white',
    }}
  >
    <div
      style={{
        position: 'absolute',
        right: -50,
        top: -50,
        width: 180,
        height: 180,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
      }}
    />

    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 position-relative">
      <div className="d-flex align-items-center gap-3">
        <button
          onClick={onBack}
          className="btn btn-light d-flex align-items-center justify-content-center"
          style={{ width: 48, height: 48, borderRadius: 14 }}
        >
          <FiArrowLeft />
        </button>

        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 22,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            backdropFilter: 'blur(10px)',
          }}
        >
          {icon}
        </div>

        <div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '1.8rem' }}>
            {title}
          </h2>
          <div style={{ opacity: 0.82, fontSize: '0.92rem' }}>{description}</div>
        </div>
      </div>

      {actions}
    </div>
  </div>
);

export default EntityPageHeader;
