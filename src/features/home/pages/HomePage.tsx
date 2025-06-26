import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { motion } from 'framer-motion';
import './HomePage.css';

function HomePage() {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const firstName = user?.nama?.split(' ')[0] || 'kamu';

  return (
    <div className="home-wrapper">
      {/* Animated Background */}
      <motion.div
        className="home-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />

      {/* Overlay Content */}
      <div className="home-overlay">
        <motion.h1
          className="home-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          SR Agency
        </motion.h1>
        <motion.p
          className="home-subtitle"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
        >
          Hi, {firstName}! Work hard, party harder ✨
        </motion.p>
      </div>
    </div>
  );
}

export default HomePage;