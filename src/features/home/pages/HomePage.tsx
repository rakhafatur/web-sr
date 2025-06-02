import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import './HomePage.css';

function HomePage() {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const firstName = user?.nama?.split(' ')[0] || null;

  return (
    <div className="home-wrapper">
      <div className="home-left">
        <h1 className="home-title">SR Agency</h1>
        <p className="home-subtitle">
          {firstName
            ? `Halo, ${firstName}! Work hard, party harder ✨`
            : 'Silakan login terlebih dahulu'}
        </p>
      </div>
      <div className="home-right">
        <img src="/assets/bg-home.png" alt="SR Hero" className="home-image" />
      </div>
    </div>
  );
}

export default HomePage;