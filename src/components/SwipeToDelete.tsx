import { useEffect, useRef, useState, type ReactNode } from 'react';
import { FiTrash2 } from 'react-icons/fi';

type Props = {
  onDelete: () => void;
  children: ReactNode;
  borderRadius?: number;
};

const REVEAL_WIDTH = 72;
const LOCK_THRESHOLD = 8;

/** Geser baris ke kiri untuk menyingkap tombol hapus — pola swipe-to-delete
    ala Mail/Gmail. Listener dipasang per-instance lewat ref (bukan window,
    beda dari PullToRefresh) supaya tiap baris punya gesture sendiri-sendiri
    tanpa saling ganggu, dan arah gesture (horizontal vs vertical) dikunci
    di awal supaya tidak bentrok dengan scroll vertikal halaman. */
const SwipeToDelete = ({ onDelete, children, borderRadius = 12 }: Props) => {
  const [translateX, setTranslateX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const rowRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const baseX = useRef(0);
  const direction = useRef<'horizontal' | 'vertical' | null>(null);
  const openRef = useRef(false);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      baseX.current = openRef.current ? -REVEAL_WIDTH : 0;
      direction.current = null;
      setDragging(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const dx = touch.clientX - startX.current;
      const dy = touch.clientY - startY.current;

      if (!direction.current) {
        if (Math.abs(dx) < LOCK_THRESHOLD && Math.abs(dy) < LOCK_THRESHOLD) return;
        direction.current = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
      }

      if (direction.current !== 'horizontal') return;

      e.preventDefault();
      const next = Math.min(0, Math.max(-REVEAL_WIDTH, baseX.current + dx));
      setTranslateX(next);
    };

    const finishDrag = () => {
      setDragging(false);

      if (direction.current === 'horizontal') {
        setTranslateX((current) => {
          const shouldOpen = current < -REVEAL_WIDTH / 2;
          openRef.current = shouldOpen;
          return shouldOpen ? -REVEAL_WIDTH : 0;
        });
      }

      direction.current = null;
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', finishDrag);
    el.addEventListener('touchcancel', finishDrag);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', finishDrag);
      el.removeEventListener('touchcancel', finishDrag);
    };
  }, []);

  const handleDeleteClick = () => {
    setTranslateX(0);
    openRef.current = false;
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

      <div
        ref={rowRef}
        style={{
          position: 'relative',
          zIndex: 2,
          transform: `translateX(${translateX}px)`,
          transition: dragging ? 'none' : 'transform 0.2s ease',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeToDelete;
