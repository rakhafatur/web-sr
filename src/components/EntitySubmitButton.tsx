import { ReactNode } from 'react';
import { FiCheckCircle } from 'react-icons/fi';

type Props = {
  onClick: () => void;
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
};

/** Tombol submit utama di bawah form Tambah entitas — full-width, tampil
    setelah semua field, bukan tombol kecil di header (mudah kelewat &
    jauh dari konteks form). Dipakai seragam di semua halaman Tambah. */
const EntitySubmitButton = ({ onClick, loading, loadingLabel = 'Menyimpan...', children }: Props) => (
  <div className="mt-4">
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-100"
      style={{
        border: 'none',
        borderRadius: 18,
        background: 'linear-gradient(135deg, var(--color-green), var(--color-accent))',
        color: 'white',
        fontWeight: 700,
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
      }}
    >
      {loading ? (
        <>
          <div className="spinner-border spinner-border-sm" />
          {loadingLabel}
        </>
      ) : (
        <>
          <FiCheckCircle />
          {children}
        </>
      )}
    </button>
  </div>
);

export default EntitySubmitButton;
