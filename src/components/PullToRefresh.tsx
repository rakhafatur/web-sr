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
    scroll konten biasa.

    Listener dipasang SEKALI saja (bukan re-attach tiap pullDistance
    berubah) dan semua nilai yang dibaca di dalam handler pakai ref, bukan
    closure state — sebelumnya effect bergantung ke [pullDistance,
    refreshing] yang berubah puluhan kali/detik selama gesture aktif,
    menyebabkan race condition antara render React dan event sentuh asli
    (konten "nyangkut"/tidak kembali ke posisi awal yang tepat). touchcancel
    juga ditangani — tanpa ini, gesture yang dibatalkan sistem (cukup umum
    di mobile) bikin pullDistance nyangkut permanen karena touchend tidak
    pernah terpanggil.

    `touchmove` dengan { passive: false } SEBELUMNYA dipasang permanen di
    window sepanjang halaman terbuka, meskipun 99% gesture bukan pull
    (scroll biasa di tengah/bawah halaman). Listener non-passive seperti
    ini memaksa browser menunggu handler JS selesai jalan dulu sebelum
    commit ke native scroll di SETIAP frame sentuh — kalau main thread
    lagi sibuk (render ulang, animasi), scroll jadi "macet"/tidak
    responsif sesaat, termasuk saat scroll dari posisi paling bawah.
    Diperbaiki dengan hanya memasang `touchmove` saat gesture pull benar-
    benar dimulai (di dalam handleTouchStart) dan melepasnya lagi begitu
    gesture selesai/batal — jadi scroll normal di luar area atas halaman
    sama sekali tidak melewati listener ini.

    Pengecekan posisi juga dilonggarkan dari `scrollY === 0` jadi
    `scrollY <= 0` — di iOS, rubber-band overscroll di paling atas bisa
    bikin scrollY sedikit negatif, dan perbandingan strict `=== 0`
    membuat gesture pull kadang tidak terdeteksi (submitted balik ke
    posisi awal tapi terasa tidak semestinya) tergantung timing. */
const PullToRefresh = ({ onRefresh, children }: Props) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  const startY = useRef(0);
  const pullingRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    const detachTouchMove = () => {
      window.removeEventListener('touchmove', handleTouchMove);
    };

    const reset = () => {
      pullingRef.current = false;
      pullDistanceRef.current = 0;
      setIsPulling(false);
      setPullDistance(0);
      detachTouchMove();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pullingRef.current || refreshingRef.current) return;

      const delta = e.touches[0].clientY - startY.current;

      if (delta <= 0 || window.scrollY > 0) {
        reset();
        return;
      }

      e.preventDefault();
      const next = Math.min(MAX_PULL, delta * 0.5);
      pullDistanceRef.current = next;
      setPullDistance(next);
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Abaikan gesture yang mulai di dalam area yang punya scroll sendiri
      // (mis. panel notifikasi, bottom-sheet modal) — tanpa ini, listener
      // touchmove di sini bisa "mencuri" gesture scroll di area tersebut
      // dan malah preventDefault-nya, bikin area itu jadi tidak bisa
      // di-scroll secara konsisten.
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-ptr-ignore]')) return;

      if (window.scrollY <= 0 && !refreshingRef.current) {
        startY.current = e.touches[0].clientY;
        pullingRef.current = true;
        setIsPulling(true);
        // Dipasang di sini (bukan permanen) supaya scroll normal di luar
        // gesture pull tidak pernah lewat listener non-passive ini sama
        // sekali — lihat catatan di atas komponen.
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
      }
    };

    const handleTouchEnd = async () => {
      if (!pullingRef.current) return;

      pullingRef.current = false;
      setIsPulling(false);
      detachTouchMove();

      const finalDistance = pullDistanceRef.current;

      if (finalDistance >= THRESHOLD) {
        refreshingRef.current = true;
        setRefreshing(true);
        pullDistanceRef.current = THRESHOLD;
        setPullDistance(THRESHOLD);

        try {
          await onRefreshRef.current();
        } finally {
          refreshingRef.current = false;
          setRefreshing(false);
          pullDistanceRef.current = 0;
          setPullDistance(0);
        }
      } else {
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    };

    const handleTouchCancel = () => {
      reset();
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchCancel);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchCancel);
      detachTouchMove();
    };
  }, []);

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
          transition: isPulling ? 'none' : 'height 0.25s ease',
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
