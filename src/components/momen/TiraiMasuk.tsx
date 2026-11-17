import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import TandaSR from './TandaSR';
import { storeMasuk } from '../../lib/momenMasuk';
import { useMomenMasuk } from '../../hooks/useMomenMasuk';
import { sapaanWaktu } from '../../utils/sapaanWaktu';
import './momen.css';

/**
 * Tirai setelah login berhasil: lingkaran gradien melebar dari tombol Masuk
 * sampai menutup layar, menyapa user, lalu terangkat ke atas dan
 * memperlihatkan Home. Dikendalikan lewat storeMasuk (tutupTirai/bukaTirai);
 * dipasang sekali di App.
 */
const TiraiMasuk = () => {
  const { tirai, asal, nama } = useMomenMasuk();
  const kurangiGerak = useReducedMotion();

  // Komponen ini hanya dirender ulang saat fase tirai berganti, jadi ukuran
  // layar cukup dibaca langsung.
  const w = window.innerWidth;
  const h = window.innerHeight;

  const x = asal?.x ?? w / 2;
  const y = asal?.y ?? h * 0.8;
  // Jari-jari yang cukup untuk mencapai sudut terjauh dari titik asal.
  const radius = Math.ceil(Math.hypot(Math.max(x, w - x), Math.max(y, h - y))) + 8;

  const membuka = tirai === 'membuka';

  return (
    <AnimatePresence>
      {tirai !== 'diam' && (
        <motion.div
          key="tirai"
          className="tirai"
          role="status"
          aria-label="Berhasil masuk"
          initial={
            kurangiGerak
              ? { opacity: 0 }
              : { clipPath: `circle(0px at ${x}px ${y}px)`, y: '0%' }
          }
          animate={
            kurangiGerak
              ? { opacity: membuka ? 0 : 1 }
              : membuka
                ? { clipPath: `circle(${radius}px at ${x}px ${y}px)`, y: '-104%' }
                : { clipPath: `circle(${radius}px at ${x}px ${y}px)`, y: '0%' }
          }
          transition={
            membuka
              ? { duration: 0.7, ease: [0.76, 0, 0.24, 1] }
              : { duration: 0.6, ease: [0.65, 0, 0.35, 1] }
          }
          onAnimationComplete={() => {
            // Fase dibaca dari store, bukan dari closure: animasi menutup bisa
            // selesai tepat saat fase sudah berganti.
            const fase = storeMasuk.get().tirai;
            if (fase === 'menutup') storeMasuk.laporTertutup();
            else if (fase === 'membuka') storeMasuk.laporTerbuka();
          }}
        >
          <motion.div
            className="tirai-isi"
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={membuka ? { opacity: 0, y: -30, scale: 1 } : { opacity: 1, y: 0, scale: 1 }}
            transition={
              membuka ? { duration: 0.3 } : { delay: 0.28, type: 'spring', stiffness: 240, damping: 22 }
            }
          >
            <TandaSR ukuran={104} diAtasGradien />
            <div>
              <div className="tirai-sapa">{sapaanWaktu(new Date().getHours())},</div>
              <p className="tirai-nama">{nama || 'Selamat datang'}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TiraiMasuk;
