import Skeleton from '../../../components/Skeleton';

type Props = {
  text: string;
};

const LedgerLoadingState = ({ text }: Props) => (
  <div
    className="page-shell d-flex flex-column gap-3"
    style={{ paddingBottom: 20, maxWidth: 560 }}
    role="status"
    aria-label={text}
  >
    {/* MONTH NAVIGATOR */}
    <div className="d-flex align-items-center justify-content-between" style={{ gap: 'var(--space-2)' }}>
      <Skeleton width={38} height={38} borderRadius="var(--radius-md)" />
      <Skeleton height={38} borderRadius="var(--radius-md)" />
      <Skeleton width={38} height={38} borderRadius="var(--radius-md)" />
    </div>

    {/* SUMMARY CARD */}
    <Skeleton height={110} borderRadius="var(--radius-lg)" />

    {/* ROWS */}
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="p-3"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-gray-200)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <Skeleton width={90} height={11} style={{ marginBottom: 8 }} />
        <Skeleton width={130} height={18} style={{ marginBottom: 8 }} />
        <Skeleton width={160} height={11} />
      </div>
    ))}
  </div>
);

export default LedgerLoadingState;
