import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion';
import { FiTrash2 } from 'react-icons/fi';
import { harusTerbuka } from '../utils/swipe';

type Props = {
  onDelete: () => void;
  children: ReactNode;
  borderRadius?: number;
};

const REVEAL_WIDTH = 72;
const SPRING = { type: 'spring', stiffness: 500, damping: 40 } as const;

/** Geser baris ke kiri untuk menyingkap tombol hapus — pola swipe-to-delete
    ala Mail/Notes. Pakai `drag` bawaan framer-motion (bukan touch handler
    manual + setState React) supaya transform-nya digerakkan langsung tanpa
    lewat render cycle React tiap piksel — versi sebelumnya terasa patah-patah
    karena tiap gerakan jari memicu re-render. dragElastic ngasih efek karet
    pas ditarik lewat batas, dan snap akhir mempertimbangkan kecepatan sentuh
    (flek cepat langsung kebuka), bukan cuma jarak — lihat harusTerbuka.

    Supaya ketukan biasa tidak ikut membuka/menampakkan tombol hapus:
    - kecepatan baru dihitung setelah jarak minimal (getaran jari saat
      mengetuk terbaca sangat cepat),
    - sentuhan yang sempat menggeser tidak diteruskan sebagai klik,
    - mengetuk baris yang sedang terbuka hanya menutupnya,
    - tombol hapus tak terlihat sampai baris benar-benar bergeser (dulu
      tembus saat latar baris berubah transparan ketika ditekan). */
const SwipeToDelete = ({ onDelete, children, borderRadius = 12 }: Props) => {
  const x = useMotionValue(0);
  const openRef = useRef(false);
  const sempatDigeserRef = useRef(false);

  // Tombol hapus muncul seiring baris bergeser, bukan selalu ada di belakang.
  const opasitasTombol = useTransform(x, [-12, 0], [1, 0]);

  const tutup = () => {
    openRef.current = false;
    animate(x, 0, SPRING);
  };

  const handleDragEnd = (_e: PointerEvent, info: PanInfo) => {
    const buka = harusTerbuka(info.offset.x, info.velocity.x, REVEAL_WIDTH);
    openRef.current = buka;
    animate(x, buka ? -REVEAL_WIDTH : 0, SPRING);
  };

  const handleDeleteClick = () => {
    tutup();
    onDelete();
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    // Klik yang lahir dari usapan, atau ketukan saat baris terbuka, tidak
    // diteruskan ke isi baris (mis. membuka halaman ubah).
    if (sempatDigeserRef.current || openRef.current) {
      e.preventDefault();
      e.stopPropagation();
      if (!sempatDigeserRef.current) tutup();
    }
    sempatDigeserRef.current = false;
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius }}>
      <motion.button
        type="button"
        onClick={handleDeleteClick}
        aria-label="Hapus"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          width: REVEAL_WIDTH,
          border: 'none',
          background: 'var(--color-expense)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          opacity: opasitasTombol,
        }}
      >
        <FiTrash2 />
      </motion.button>

      <motion.div
        drag="x"
        dragConstraints={{ left: -REVEAL_WIDTH, right: 0 }}
        dragElastic={{ left: 0.15, right: 0 }}
        dragMomentum={false}
        onPointerDownCapture={() => {
          sempatDigeserRef.current = false;
        }}
        onDragStart={() => {
          sempatDigeserRef.current = true;
        }}
        onDragEnd={handleDragEnd}
        onClickCapture={handleClickCapture}
        style={{ x, position: 'relative', zIndex: 2, touchAction: 'pan-y' }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SwipeToDelete;
