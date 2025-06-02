import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import './HomePage.css';

function HomePage() {
  const user = useSelector((state: RootState) => state.user.currentUser);

  return (
    <div className="home-page-container">
      <div className="home-content">
        <h1 className="home-title">Selamat Datang di <span className="brand">SR Agency</span></h1>
        <p className="home-subtitle">
          {user
            ? `Halo, ${user.nama}! Work hard, party harder ✨`
            : 'Silakan login terlebih dahulu'}
        </p>
      </div>
    </div>
  );
}

export default HomePage;