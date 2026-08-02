import { ReactNode } from 'react';

type Props = {
  title: string;
  description: string;
  children: ReactNode;
};

/** Kartu form dengan header bar (judul + deskripsi section) — dipakai di semua halaman Tambah/Detail entitas. */
const EntityFormCard = ({ title, description, children }: Props) => (
  <div className="card border-0 shadow-sm rounded-4" style={{ overflow: 'hidden' }}>
    <div
      className="px-4 py-3 border-bottom"
      style={{ background: 'linear-gradient(to right, var(--color-surface-2), var(--color-surface))' }}
    >
      <div className="fw-bold" style={{ color: 'var(--color-dark)' }}>
        {title}
      </div>
      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>{description}</div>
    </div>

    <div className="p-4 d-flex flex-column gap-4">{children}</div>
  </div>
);

export default EntityFormCard;
