import { ReactNode } from 'react';
import { FiInbox } from 'react-icons/fi';

type Props = {
  /** Ikon vektor (react-icons). Bawaan: kotak masuk. */
  icon?: ReactNode;
  title: string;
  description?: string;
};

/** Empty state generik (bukan card-boxed seperti LedgerEmptyState punya Ladies)
    — dipakai di tabel/list Admin ketika data kosong. Sebelumnya sebagian
    halaman pakai versi custom emoji+judul (RiwayatTransaksi), sebagian pakai
    <div className="alert alert-info"> polos satu baris (PerformaLadies,
    BukuKuning) — sekarang satu bahasa visual. */
const EmptyState = ({ icon = <FiInbox />, title, description }: Props) => (
  <div className="text-center py-5" style={{ color: 'var(--color-gray-600)' }}>
    <div
      aria-hidden
      className="d-inline-flex align-items-center justify-content-center"
      style={{
        width: 64,
        height: 64,
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-green-lighter)',
        border: '1px solid var(--color-green-light)',
        color: 'var(--color-green)',
        fontSize: 26,
      }}
    >
      {icon}
    </div>

    <h5 className="fw-bold mt-3" style={{ color: 'var(--color-dark)' }}>
      {title}
    </h5>

    {description && <div>{description}</div>}
  </div>
);

export default EmptyState;
