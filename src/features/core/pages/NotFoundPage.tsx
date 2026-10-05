import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCompass, FiHome } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import './NotFoundPage.css';

/**
 * Halaman 404. Berada di luar layout & login (lihat App.tsx), jadi tampil
 * mandiri. Tombol beranda menyesuaikan siapa yang membuka: ladies → Home
 * Ladies, user lain → Home admin, belum login → Login. Navigasi di dalam
 * SPA (tanpa memuat ulang aplikasi).
 */
function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const beranda = !user ? '/login' : user.ladies_id ? '/ladies/home' : '/';
  const labelBeranda = user ? 'Ke beranda' : 'Ke halaman masuk';
  const bisaKembali = window.history.length > 1;

  return (
    <main className="nf">
      <div className="nf-card">
        <span className="nf-icon" aria-hidden>
          <FiCompass />
        </span>
        <span className="nf-code">404</span>
        <h1 className="nf-title">Halaman tidak ditemukan</h1>
        <p className="nf-text">
          Alamat yang kamu buka tidak ada atau sudah dipindah. Cek lagi tautannya, atau
          kembali ke beranda.
        </p>

        <div className="nf-actions">
          <button type="button" className="nf-btn nf-btn--primary" onClick={() => navigate(beranda, { replace: true })}>
            <FiHome aria-hidden />
            {labelBeranda}
          </button>
          {bisaKembali && (
            <button type="button" className="nf-btn" onClick={() => navigate(-1)}>
              <FiArrowLeft aria-hidden />
              Kembali
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default NotFoundPage;
