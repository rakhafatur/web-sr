import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import './HomePage.css';

function HomePage() {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const firstName = user?.nama?.split(' ')[0] || 'kamu';

  return (
    <div className="home-wrapper">
      <div className="home-overlay">
        <h1 className="home-title">SR Agency</h1>
        <p className="home-subtitle">
          Hi, {firstName}! Work hard, party harder ✨
        </p>
      </div>
    </div>
  );
}

export default HomePage;