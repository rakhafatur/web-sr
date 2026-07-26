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
  >
    <div
      className="spinner-border"
      role="status"
      style={{ color: 'var(--color-primary)' }}
    >
      <span className="visually-hidden">Memuat...</span>
    </div>
  </div>
);

export default RouteLoader;
