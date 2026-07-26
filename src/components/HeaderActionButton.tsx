import { ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  onClick: () => void;
  children: ReactNode;
};

/** Tombol aksi utama di banner header bergradasi (List/Entity) — kontras terang di atas latar gelap-bergradasi, bukan warna solid seperti btn-success/primary. */
const HeaderActionButton = ({ icon, onClick, children }: Props) => (
  <button
    type="button"
    className="btn btn-light fw-bold d-flex align-items-center gap-2"
    style={{ borderRadius: 14, color: 'var(--color-green)' }}
    onClick={onClick}
  >
    {icon}
    {children}
  </button>
);

export default HeaderActionButton;
