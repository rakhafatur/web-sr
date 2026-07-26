import { ReactNode } from 'react';

type Variant = 'warning' | 'danger' | 'success';

type Props = {
  icon: ReactNode;
  variant: Variant;
  title: string;
  onClick: () => void;
  disabled?: boolean;
};

/** Tombol aksi baris tabel (Edit/Hapus/Approve) — icon-only 32x32, standar untuk semua data table & card list. */
const ActionIconButton = ({ icon, variant, title, onClick, disabled }: Props) => (
  <button
    type="button"
    className={`btn btn-sm btn-outline-${variant} d-flex align-items-center justify-content-center`}
    title={title}
    aria-label={title}
    onClick={onClick}
    disabled={disabled}
    style={{
      width: 32,
      height: 32,
      padding: 0,
      borderRadius: 'var(--radius-sm)',
    }}
  >
    {icon}
  </button>
);

export default ActionIconButton;
