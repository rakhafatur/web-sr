import type { ReactNode } from 'react';

type Props = {
  label: string;
  /** Boleh <Money>, boleh teks biasa. */
  nilai: ReactNode;
  catatan?: ReactNode;
  ikon?: ReactNode;
};

/**
 * Kartu angka ringkas.
 *
 * Menyatukan tiga tampilan berbeda yang sekarang dipakai untuk hal yang sama:
 * AbsensiSummaryCards (latar lembut, tanpa ikon), LedgerSummaryCard (gradient
 * penuh, teks putih), dan dua kartu inline di RekapVoucher & PerformaLadies.
 */
const StatCard = ({ label, nilai, catatan, ikon }: Props) => (
  <div className="bg-surface border border-line rounded-lg p-3.5">
    <div className="flex items-start justify-between gap-2">
      <p className="text-xs font-medium uppercase tracking-wide text-fg-faint">{label}</p>
      {ikon && (
        <span className="text-fg-faint shrink-0 [&>svg]:size-4" aria-hidden="true">
          {ikon}
        </span>
      )}
    </div>

    <div className="tabular mt-1.5 text-2xl font-semibold tracking-tight text-fg">
      {nilai}
    </div>

    {catatan && <p className="mt-0.5 text-xs text-fg-muted">{catatan}</p>}
  </div>
);

export default StatCard;
