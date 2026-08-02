import { ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  title: string;
  description: string;
  actions?: ReactNode;
};

/** Banner atas halaman Tambah/Detail entitas (Agent/Pengawas/Ladies/User) — dipakai seragam di semua.
    Tanpa tombol back — navigasi kembali sudah lewat swipe/gesture bawaan browser. */
const EntityPageHeader = ({ icon, title, description, actions }: Props) => (
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
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 'var(--radius-xl)',
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
          <h2 className="fw-bold mb-1" style={{ fontSize: 'var(--font-size-3xl)' }}>
            {title}
          </h2>
          <div style={{ opacity: 0.82, fontSize: 'var(--font-size-sm)' }}>{description}</div>
        </div>
      </div>

      {actions}
    </div>
  </div>
);

export default EntityPageHeader;
