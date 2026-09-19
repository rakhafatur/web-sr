import type { ReactNode } from 'react';

type Props = {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Matikan untuk isi yang harus menyentuh tepi kartu, mis. tabel. */
  padding?: boolean;
  children: ReactNode;
};

/**
 * Kartu berjudul — pengganti band header gradient yang sekarang di-copy manual
 * di belasan tempat (AddTransaksiPage, PerformaLadiesPage, RekapVoucherPage,
 * ListPageToolbar), bahkan dengan arah gradient yang tidak konsisten antar
 * kartu bersebelahan.
 *
 * Tanpa shadow: struktur dibangun dari garis 1px. Shadow disimpan khusus untuk
 * elemen yang benar-benar melayang (dropdown, modal, sheet).
 */
const SectionCard = ({ title, subtitle, actions, padding = true, children }: Props) => (
  <div className="bg-surface border border-line rounded-lg overflow-hidden">
    {(title || actions) && (
      <header className="flex items-start justify-between gap-3 px-4 py-3 border-b border-line">
        <div className="min-w-0">
          {title && <h2 className="text-base font-semibold text-fg truncate">{title}</h2>}
          {subtitle && <p className="text-xs text-fg-faint mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </header>
    )}

    <div className={padding ? 'p-4' : ''}>{children}</div>
  </div>
);

export default SectionCard;
