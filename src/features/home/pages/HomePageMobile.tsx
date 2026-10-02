import { motion } from 'framer-motion';
import bgImage from '../../../assets/bg-home.jpg';
import { useAuth } from '../../../context/AuthContext';
import './HomePage.css';

const sapaanWaktu = (jam: number) => {
  if (jam < 11) return 'Selamat pagi';
  if (jam < 15) return 'Selamat siang';
  if (jam < 18) return 'Selamat sore';
  return 'Selamat malam';
};

/**
 * Home admin versi mobile — polos, tanpa Header app (dicabut di MainLayout):
 * foto latar SR yang diredupkan, tanda brand di atas, dan sapaan besar di
 * bagian bawah layar (zona jempol). Navigasi tetap lewat navbar bawah.
 */
function HomePageMobile() {
  const { user } = useAuth();
  const sekarang = new Date();
  const tanggal = sekarang.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="ah">
      {/* alt kosong disengaja: gambar ini murni hiasan. */}
      <img src={bgImage} alt="" className="ah-bg" />

      <header className="ah-top">
        <span className="ah-mark" aria-hidden>SR</span>
        <span className="ah-brand">SR Agency</span>
      </header>

      <motion.div
        className="ah-hero"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="ah-date">{tanggal}</div>
        <div className="ah-greet">{sapaanWaktu(sekarang.getHours())},</div>
        <h1 className="ah-name">{user?.nama || 'Admin'}</h1>
        <p className="ah-tagline">Work hard, party harder</p>
      </motion.div>
    </div>
  );
}

export default HomePageMobile;
