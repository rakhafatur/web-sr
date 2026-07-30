import { ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  onClick: () => void;
  children: ReactNode;
  /** Bentangkan penuh & rata tengah — dipakai saat header wrap ke baris sendiri di mobile, supaya jadi CTA yang jelas, bukan pil kecil rata kiri. */
  fullWidth?: boolean;
};

/** Tombol aksi utama di banner header bergradasi (List/Entity) — kontras terang di atas latar gelap-bergradasi, bukan warna solid seperti btn-success/primary. */
const HeaderActionButton = ({ icon, onClick, children, fullWidth }: Props) => (
  <button
    type="button"
    className="btn btn-light fw-bold d-flex align-items-center gap-2"
    style={{
      borderRadius: 14,
      color: 'var(--color-green)',
      width: fullWidth ? '100%' : undefined,
      justifyContent: fullWidth ? 'center' : undefined,
      height: fullWidth ? 48 : undefined,
    }}
    onClick={onClick}
  >
    {icon}
    {children}
  </button>
);

export default HeaderActionButton;
