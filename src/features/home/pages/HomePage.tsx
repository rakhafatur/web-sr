import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';

function HomePage() {
  const user = useSelector((state: RootState) => state.user.currentUser);

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center text-center"
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at center, #1b0036 0%, #0f001e 100%)',
        padding: '2rem',
        color: 'white',
      }}
    >
      <h1
        className="fw-bold"
        style={{
          fontSize: '2.5rem',
          color: '#ffc107',
          textShadow: '0 0 10px rgba(255, 193, 7, 0.5)',
        }}
      >
        Selamat Datang di SR Agency
      </h1>

      <p className="mt-3 fs-5" style={{ color: '#ccc' }}>
        {user
          ? `Halo, ${user.nama}! Work hard, party harder ✨`
          : 'Silakan login terlebih dahulu'}
      </p>
    </div>
  );
}

export default HomePage;