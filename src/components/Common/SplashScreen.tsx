import { useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import Aurora from '../momen/Aurora';
import TandaSR from '../momen/TandaSR';
import { storeMasuk } from '../../lib/momenMasuk';
import '../momen/momen.css';

/** Lama splash tampil sebelum mulai menghilang. */
const DURASI_MS = 1700;

const wadah: Variants = {
  awal: { opacity: 1 },
  tampil: { opacity: 1, transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
  // Latar memudar sementara isinya "menembus" ke depan (lihat `tanda.keluar`).
  keluar: { opacity: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } },
};

const tanda: Variants = {
  awal: { opacity: 0, scale: 0.55, rotate: -12 },
  tampil: { opacity: 1, scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 220, damping: 16 } },
  keluar: { scale: 3.2, opacity: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } },
};

const naik: Variants = {
  awal: { opacity: 0, y: 18 },
  tampil: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  keluar: { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

/**
 * Splash pembuka: aurora, tanda brand yang "memantul" masuk, nama app, dan
 * garis kemajuan. Saat selesai, tanda membesar menembus layar sementara
 * latarnya memudar — app di bawahnya sudah siap dan langsung memainkan
 * animasi masuknya (lihat lib/momenMasuk).
 *
 * Harus dirender di dalam <AnimatePresence> supaya animasi keluarnya jalan.
 */
const SplashScreen = ({ onSelesai }: { onSelesai: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      storeMasuk.selesaiSplash();
      onSelesai();
    }, DURASI_MS);
    return () => clearTimeout(timer);
  }, [onSelesai]);

  return (
    <motion.div
      className="splash"
      variants={wadah}
      initial="awal"
      animate="tampil"
      exit="keluar"
      role="status"
      aria-label="Memuat SR Agency"
    >
      <Aurora varian="penuh" />

      <div className="splash-isi">
        <motion.div variants={tanda}>
          <TandaSR ukuran={132} />
        </motion.div>

        <motion.div className="splash-teks" variants={naik}>
          <h1 className="splash-nama">SR Agency</h1>
          <p className="splash-tagline">Work hard, party harder</p>
        </motion.div>

        <motion.div className="splash-garis" variants={naik}>
          <motion.span
            className="splash-garis-isi"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: DURASI_MS / 1000 - 0.35, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
