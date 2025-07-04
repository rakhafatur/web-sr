import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { motion } from 'framer-motion';
import './HomePage.css';
import bgImage from '../../../assets/bg-home.png'; // ✅ path benar

function HomePage() {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const firstName = user?.nama?.split(' ')[0] || 'kamu';

  return (
    <div className="home-wrapper">
      {/* ✅ Gunakan <img> agar responsive di semua device */}
      <img src={bgImage} alt="background" className="home-background-image" />

      <div className="home-overlay">
        <motion.h1
          className="home-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
        >
          SR Agency
        </motion.h1>

        <motion.p
          className="home-subtitle"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
        >
          Hi, {firstName}! Work hard, party harder ✨
        </motion.p>
      </div>
    </div>
  );
}

export default HomePage;