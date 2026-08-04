import { useEffect, useRef, useState, type ReactNode } from 'react';
import { FiLoader } from 'react-icons/fi';

type Props = {
  onRefresh: () => void | Promise<void>;
  children: ReactNode;
};

const THRESHOLD = 64;
const MAX_PULL = 90;

/** Tarik-untuk-refresh ala aplikasi mobile — cuma aktif kalau halaman
    sedang di posisi paling atas (scrollY 0), supaya tidak konflik dengan
    scroll konten biasa. */
const PullToRefresh = ({ onRefresh, children }: Props) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0 && !refreshing) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pulling.current || refreshing) return;

      const delta = e.touches[0].clientY - startY.current;

      if (delta <= 0 || window.scrollY > 0) {
        pulling.current = false;
        setPullDistance(0);
        return;
      }

      e.preventDefault();
      setPullDistance(Math.min(MAX_PULL, delta * 0.5));
    };

    const handleTouchEnd = async () => {
      if (!pulling.current) return;
      pulling.current = false;

      if (pullDistance >= THRESHOLD) {
        setRefreshing(true);
        setPullDistance(THRESHOLD);

        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pullDistance, refreshing]);

  const indicatorHeight = refreshing ? THRESHOLD : pullDistance;
  const showIndicator = indicatorHeight > 0;

  return (
    <>
      <div
        style={{
          height: indicatorHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transition: pulling.current ? 'none' : 'height 0.25s ease',
        }}
      >
        {showIndicator && (
          <FiLoader
            size={20}
            className={refreshing ? 'spinner-icon' : ''}
            style={{
              color: 'var(--color-primary)',
              transform: refreshing ? undefined : `rotate(${(pullDistance / THRESHOLD) * 360}deg)`,
              opacity: Math.min(1, pullDistance / THRESHOLD),
            }}
          />
        )}
      </div>

      {children}
    </>
  );
};

export default PullToRefresh;
