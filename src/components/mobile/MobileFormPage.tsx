import { ReactNode } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import MobilePageBar from '../MobilePageBar';
import '../../styles/mobile-admin.css';

type Props = {
  title: string;
  backTo: string;
  /** Diisi di halaman detail saat mode lihat — tombol ✏️ di bar atas. */
  onEdit?: () => void;
  /** Identitas di atas form (halaman detail). */
  identity?: { name: string; sub?: string };
  sectionTitle: string;
  children: ReactNode;
  /** Tombol di bawah form (Simpan, atau Batal/Simpan). */
  footer?: ReactNode;
};

/**
 * Cangkang halaman Tambah/Detail data master versi mobile: bar atas,
 * identitas opsional, satu kartu berisi kolom, dan tombol di bawahnya.
 */
const MobileFormPage = ({ title, backTo, onEdit, identity, sectionTitle, children, footer }: Props) => (
  <div className="tm-page">
    <MobilePageBar
      title={title}
      backTo={backTo}
      action={onEdit ? { icon: <FiEdit2 />, label: `Ubah ${title.toLowerCase()}`, onClick: onEdit } : undefined}
    />

    {identity && (
      <section className="tm-identity" aria-label="Identitas">
        <span className="tm-avatar" aria-hidden>
          {(identity.name || '?').charAt(0).toUpperCase()}
        </span>
        <h2 className="tm-identity-name">{identity.name || '-'}</h2>
        {identity.sub && <div className="tm-identity-sub">{identity.sub}</div>}
      </section>
    )}

    <div className="tm-stack">
      <h2 className="tm-section-title">{sectionTitle}</h2>
      <div className="tm-card tm-sheet-form">{children}</div>
      {footer}
    </div>
  </div>
);

export default MobileFormPage;
