import Skeleton from '../../../components/Skeleton';

// Mengikuti susunan HomeLadiesPage: sapaan, hero, ringkasan, menu cepat, CTA.
const cardStyle: React.CSSProperties = {
  borderRadius: 'var(--radius-xl)',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-gray-200)',
};

const HomeLadiesSkeleton = () => (
  <div className="ladies-home-wrapper" role="status" aria-label="Memuat data">
    <div className="content-container d-flex flex-column gap-3">
      {/* SAPAAN */}
      <div style={{ padding: '4px 4px 0' }}>
        <Skeleton width={110} height={13} style={{ marginBottom: 8 }} />
        <Skeleton width={170} height={26} />
      </div>

      {/* HERO */}
      <div style={{ ...cardStyle, padding: '20px 20px 16px' }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <Skeleton width={130} height={13} />
          <Skeleton width={36} height={36} borderRadius="var(--radius-full)" />
        </div>
        <Skeleton width={200} height={36} style={{ marginBottom: 10 }} />
        <Skeleton width={160} height={13} style={{ marginBottom: 32 }} />
        <div className="d-flex justify-content-between">
          <Skeleton width={110} height={13} />
          <Skeleton width={90} height={13} />
        </div>
      </div>

      {/* RINGKASAN */}
      <div style={{ ...cardStyle, padding: 16 }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <Skeleton width={140} height={16} />
          <Skeleton width={100} height={24} borderRadius="var(--radius-full)" />
        </div>
        <div className="d-flex gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ flex: 1 }}>
              <Skeleton width="70%" height={11} style={{ marginBottom: 10 }} />
              <Skeleton width="45%" height={26} style={{ marginBottom: 10 }} />
              <Skeleton width="80%" height={11} />
            </div>
          ))}
        </div>
      </div>

      {/* MENU CEPAT */}
      <div style={{ ...cardStyle, padding: '16px 16px 20px' }}>
        <Skeleton width={100} height={16} style={{ marginBottom: 16 }} />
        <div className="d-flex justify-content-around">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="d-flex flex-column align-items-center" style={{ gap: 8 }}>
              <Skeleton width={56} height={56} borderRadius="var(--radius-full)" />
              <Skeleton width={40} height={10} />
            </div>
          ))}
        </div>
      </div>

      {/* SMART CHAT CTA */}
      <div className="d-flex align-items-center gap-3" style={{ ...cardStyle, padding: '12px 12px 12px 16px' }}>
        <Skeleton width={44} height={44} borderRadius="var(--radius-full)" />
        <div style={{ flex: 1 }}>
          <Skeleton width="55%" height={14} style={{ marginBottom: 8 }} />
          <Skeleton width="80%" height={11} />
        </div>
        <Skeleton width={40} height={40} borderRadius="var(--radius-full)" />
      </div>
    </div>
  </div>
);

export default HomeLadiesSkeleton;
