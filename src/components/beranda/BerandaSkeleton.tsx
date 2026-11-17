import Skeleton from '../Skeleton';
import Aurora from '../momen/Aurora';
import './beranda.css';

const kartu: React.CSSProperties = {
  borderRadius: 'var(--radius-xl)',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-gray-200)',
  padding: 16,
};

/** Kerangka memuat Home mobile — mengikuti susunan BerandaMobile: sapaan,
    hero, dua baris petak, lalu satu kartu daftar. */
const BerandaSkeleton = () => (
  <div className="bm" role="status" aria-label="Memuat data">
    <Aurora varian="atas" />

    <div className="bm-isi">
      <div className="bm-atas">
        <div className="bm-topbar">
          <Skeleton width={48} height={48} borderRadius="var(--radius-full)" />
          <Skeleton width={120} height={36} borderRadius="var(--radius-full)" />
        </div>
        <Skeleton width={110} height={14} style={{ marginBottom: 10 }} />
        <Skeleton width={190} height={34} />
      </div>

      <div style={{ ...kartu, borderRadius: 28, padding: 20 }}>
        <Skeleton width={130} height={14} style={{ marginBottom: 14 }} />
        <Skeleton width={200} height={38} style={{ marginBottom: 10 }} />
        <Skeleton width={170} height={13} style={{ marginBottom: 24 }} />
        <Skeleton height={64} borderRadius="var(--radius-md)" />
      </div>

      <div className="bm-kisi">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ ...kartu, minHeight: 124 }}>
            <Skeleton width="60%" height={13} style={{ marginBottom: 14 }} />
            <Skeleton width="45%" height={28} style={{ marginBottom: 10 }} />
            <Skeleton width="80%" height={11} />
          </div>
        ))}
      </div>

      <div style={kartu}>
        <Skeleton width={150} height={16} style={{ marginBottom: 16 }} />
        {[0, 1, 2].map((i) => (
          <div key={i} className="d-flex align-items-center gap-3" style={{ padding: '10px 0' }}>
            <Skeleton width={40} height={40} borderRadius="var(--radius-full)" />
            <div style={{ flex: 1 }}>
              <Skeleton width="55%" height={14} style={{ marginBottom: 8 }} />
              <Skeleton width="35%" height={11} />
            </div>
            <Skeleton width={48} height={14} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default BerandaSkeleton;
