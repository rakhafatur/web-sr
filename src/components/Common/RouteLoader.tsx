import { FiLoader } from 'react-icons/fi';

/** Fallback Suspense saat lazy-load chunk halaman — dipakai agar transisi antar halaman tidak menampilkan teks polos tak bertema. */
const RouteLoader = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
    }}
    role="status"
    aria-label="Memuat"
  >
    <FiLoader size={28} className="spinner-icon" />
  </div>
);

export default RouteLoader;
