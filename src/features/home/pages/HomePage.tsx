import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './HomePage.css';
import bgImage from '../../../assets/bg-home.png';
import heroImage from '../../../assets/sr-home-char.png';

function HomePage() {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const firstName = user?.nama?.split(' ')[0] || 'kamu';
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">
      {/* ✅ Background untuk mobile */}
      <img src={bgImage} alt="background" className="home-bg-mobile" />

      {/* ✅ Konten desktop */}
      <div className="home-content">
        <div className="home-card">
          <div className="home-text">
            <motion.h1
              className="home-title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
            >
              Hi, {firstName}! 
            </motion.h1>

            <motion.p
              className="home-subtitle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
            >
              Work hard, party harder ✨<br />
              Kelola absensi, voucher, dan performa langsung dari dashboard SR Agency.
            </motion.p>

            <motion.div
              className="home-actions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <p className="home-action-label">Hari ini mau cek apa dulu?</p>
              <div className="home-pills">
                <span className="pill" onClick={() => navigate('/add-transaksi')}>🎟️ Transaksi Ladies</span>
                <span className="pill" onClick={() => navigate('/absensi')}>📅 Absensi</span>
                <span className="pill" onClick={() => navigate('/rekap-voucher')}>📊 Rekap Voucher</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="home-image"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <img src={heroImage} alt="SR Agency Hero" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;