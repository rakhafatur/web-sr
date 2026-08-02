type Props = {
  icon?: string;
  title: string;
  description?: string;
};

/** Empty state generik (bukan card-boxed seperti LedgerEmptyState punya Ladies)
    — dipakai di tabel/list Admin ketika data kosong. Sebelumnya sebagian
    halaman pakai versi custom emoji+judul (RiwayatTransaksi), sebagian pakai
    <div className="alert alert-info"> polos satu baris (PerformaLadies,
    BukuKuning) — sekarang satu bahasa visual. */
const EmptyState = ({ icon = '📭', title, description }: Props) => (
  <div className="text-center py-5" style={{ color: 'var(--color-gray-500)' }}>
    <div style={{ fontSize: 60 }}>{icon}</div>

    <h5 className="fw-bold mt-3" style={{ color: 'var(--color-dark)' }}>
      {title}
    </h5>

    {description && <div>{description}</div>}
  </div>
);

export default EmptyState;
