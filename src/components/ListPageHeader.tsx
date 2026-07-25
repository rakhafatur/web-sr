import { ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  title: string;
  description: string;
};

/** Banner atas halaman list/menu (ikon + judul + deskripsi) — dipakai seragam di semua halaman menu. */
const ListPageHeader = ({ icon, title, description }: Props) => (
  <div
    className="mb-3 p-3 p-md-4 rounded-4 shadow-sm position-relative overflow-hidden"
    style={{
      background: 'linear-gradient(135deg, var(--color-green), #7be0a9)',
      color: 'white',
    }}
  >
    <div className="d-flex gap-3 align-items-center">
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          background: 'rgba(255,255,255,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div>
        <div className="fw-bold" style={{ fontSize: '1.25rem' }}>
          {title}
        </div>
        <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>{description}</div>
      </div>
    </div>
  </div>
);

export default ListPageHeader;
