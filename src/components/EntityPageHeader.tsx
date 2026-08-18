import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

type Props = {
  icon: ReactNode;
  title: string;
  description: string;
  actions?: ReactNode;
  /** Halaman induk untuk tombol kembali. Sengaja berupa path, bukan
      `navigate(-1)`: aplikasi ini terpasang sebagai PWA, dan kalau halaman
      dibuka langsung (cold start / deep link) riwayatnya kosong sehingga
      `navigate(-1)` justru keluar dari aplikasi. */
  backTo?: string;
};

/** Banner atas halaman Tambah/Detail entitas (Agent/Pengawas/Ladies/User) — dipakai seragam di semua.
    Tombol kembali wajib ada di sini: dalam mode PWA terpasang tidak ada tombol
    back bawaan browser maupun gesture geser, jadi satu-satunya jalan keluar
    tadinya lewat menu bawah — dan itu berarti kehilangan konteks. */
const EntityPageHeader = ({ icon, title, description, actions, backTo }: Props) => {
  const navigate = useNavigate();

  return (
  <div
    className="mb-4 p-4 rounded-4 shadow-sm position-relative overflow-hidden"
    style={{
      background: 'linear-gradient(135deg, var(--color-green), var(--color-accent))',
      color: 'white',
    }}
  >
    <div
      style={{
        position: 'absolute',
        right: -50,
        top: -50,
        width: 180,
        height: 180,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
      }}
    />

    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 position-relative">
      <div className="d-flex align-items-center gap-3">
        {backTo && (
          <button
            type="button"
            aria-label="Kembali"
            onClick={() => navigate(backTo)}
            style={{
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.28)',
              background: 'rgba(255,255,255,0.16)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
            }}
          >
            <FiArrowLeft size={20} />
          </button>
        )}

        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 'var(--radius-xl)',
            background: 'rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            backdropFilter: 'blur(10px)',
          }}
        >
          {icon}
        </div>

        <div>
          <h2 className="fw-bold mb-1" style={{ fontSize: 'var(--font-size-3xl)' }}>
            {title}
          </h2>
          <div style={{ opacity: 0.82, fontSize: 'var(--font-size-sm)' }}>{description}</div>
        </div>
      </div>

      {actions}
    </div>
  </div>
  );
};

export default EntityPageHeader;
