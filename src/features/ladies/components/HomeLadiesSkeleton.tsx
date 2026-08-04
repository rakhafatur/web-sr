import Skeleton from '../../../components/Skeleton';

const cardStyle: React.CSSProperties = {
  borderRadius: 'var(--radius-xl)',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-gray-200)',
};

const HomeLadiesSkeleton = () => (
  <div className="ladies-home-wrapper" role="status" aria-label="Memuat data">
    <div className="content-container d-flex flex-column gap-3">
      {/* HERO */}
      <div style={{ ...cardStyle, padding: '26px 24px' }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <Skeleton width={130} height={12} />
          <Skeleton width={32} height={32} borderRadius="var(--radius-full)" />
        </div>

        <Skeleton width={180} height={34} style={{ marginBottom: 10 }} />
        <Skeleton width={140} height={12} style={{ marginBottom: 24 }} />

        <Skeleton height={8} borderRadius="var(--radius-full)" style={{ marginBottom: 22 }} />

        <div className="d-flex align-items-center gap-4">
          <Skeleton height={32} style={{ flex: 1 }} />
          <Skeleton height={32} style={{ flex: 1 }} />
        </div>
      </div>

      {/* SMART CHAT CTA */}
      <div className="d-flex align-items-center gap-3" style={{ ...cardStyle, borderRadius: 'var(--radius-lg)', padding: '16px 18px' }}>
        <Skeleton width={44} height={44} borderRadius="var(--radius-md)" />
        <div style={{ flex: 1 }}>
          <Skeleton width="55%" height={14} style={{ marginBottom: 8 }} />
          <Skeleton width="80%" height={11} />
        </div>
      </div>

      {/* MENU GRID */}
      <div>
        <Skeleton width={90} height={13} style={{ marginBottom: 14 }} />
        <div className="d-flex justify-content-between">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="d-flex flex-column align-items-center" style={{ gap: 8 }}>
              <Skeleton width={50} height={50} borderRadius="var(--radius-lg)" />
              <Skeleton width={40} height={9} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default HomeLadiesSkeleton;
