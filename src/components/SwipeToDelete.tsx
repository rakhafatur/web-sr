import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, animate, type PanInfo } from 'framer-motion';
import { FiTrash2 } from 'react-icons/fi';

type Props = {
  onDelete: () => void;
  children: ReactNode;
  borderRadius?: number;
};

const REVEAL_WIDTH = 72;
const VELOCITY_THRESHOLD = 500;
const SPRING = { type: 'spring', stiffness: 500, damping: 40 } as const;

/** Geser baris ke kiri untuk menyingkap tombol hapus — pola swipe-to-delete
    ala Mail/Notes. Pakai `drag` bawaan framer-motion (bukan touch handler
    manual + setState React) supaya transform-nya digerakkan langsung tanpa
    lewat render cycle React tiap piksel — versi sebelumnya terasa patah-patah
    karena tiap gerakan jari memicu re-render. dragElastic ngasih efek karet
    pas ditarik lewat batas, dan snap akhir mempertimbangkan kecepatan sentuh
    (flek cepat langsung kebuka walau belum jauh geserannya), bukan cuma jarak. */
const SwipeToDelete = ({ onDelete, children, borderRadius = 12 }: Props) => {
  const x = useMotionValue(0);
  const openRef = useRef(false);

  const handleDragEnd = (_e: PointerEvent, info: PanInfo) => {
    const shouldOpen =
      info.offset.x < -REVEAL_WIDTH / 2 || info.velocity.x < -VELOCITY_THRESHOLD;

    openRef.current = shouldOpen;
    animate(x, shouldOpen ? -REVEAL_WIDTH : 0, SPRING);
  };

  const handleDeleteClick = () => {
    openRef.current = false;
    animate(x, 0, SPRING);
    onDelete();
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius }}>
      <button
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
        }}
      >
        <FiTrash2 />
      </button>

      <motion.div
        drag="x"
        dragConstraints={{ left: -REVEAL_WIDTH, right: 0 }}
        dragElastic={{ left: 0.15, right: 0 }}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x, position: 'relative', zIndex: 2, touchAction: 'pan-y' }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SwipeToDelete;
