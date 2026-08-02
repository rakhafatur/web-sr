import { ReactNode } from 'react';
import { useMediaQuery } from 'react-responsive';

type Props = {
  icon: ReactNode;
  title: string;
  description: string;
};

/** Hero header gradient untuk halaman fitur/workflow (Transaksi, Rekap,
    Performa, Smart Chat, Absensi) — beda dari ListPageHeader (halaman List/Menu)
    dan EntityPageHeader (Create/Detail entitas): treatment lebih besar & bold
    karena halaman ini biasanya jadi tujuan utama pengguna, bukan daftar data.
    Sebelumnya JSX ini di-copy manual di 6 halaman dan diam-diam diverge
    (opacity deskripsi 0.7/0.75/0.78/0.85, ukuran ikon 60 vs 64px, dst). */
const FeaturePageHeader = ({ icon, title, description }: Props) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <div
      className="mb-4 p-4 rounded-4 shadow-sm"
      style={{
        background: 'linear-gradient(135deg, var(--color-green), var(--color-accent))',
        color: 'white',
      }}
    >
      <div className="d-flex align-items-center gap-3">
        <div
          style={{
            width: isMobile ? 54 : 60,
            height: isMobile ? 54 : 60,
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? 22 : 26,
            backdropFilter: 'blur(8px)',
          }}
        >
          {icon}
        </div>

        <div>
          <h2
            className="fw-semibold mb-0"
            style={{ fontSize: isMobile ? '1rem' : '1.8rem', lineHeight: 1.2 }}
          >
            {title}
          </h2>

          <div
            style={{
              opacity: 0.8,
              fontSize: isMobile ? '0.72rem' : '0.92rem',
              marginTop: 2,
            }}
          >
            {description}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturePageHeader;
