import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FiWifiOff } from 'react-icons/fi';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

/** Banner global saat koneksi internet putus — dipasang di root app supaya
    tampil di semua halaman (termasuk login), bukan cuma yang sempat cek
    `error` dari Supabase sendiri-sendiri. */
const OfflineBanner = () => {
  const isOnline = useOnlineStatus();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
    } else if (wasOffline.current) {
      wasOffline.current = false;
      toast.success('Koneksi internet tersambung kembali.');
    }
  }, [isOnline]);

  if (isOnline) return null;

  return (
    <div
      className="d-flex align-items-center justify-content-center gap-2"
      role="status"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2000,

        background: 'var(--color-expense)',
        color: 'white',

        fontSize: 'var(--font-size-xs)',
        fontWeight: 700,

        padding: '8px 12px',
        paddingTop: 'calc(8px + env(safe-area-inset-top))',
      }}
    >
      <FiWifiOff size={14} />
      Tidak ada koneksi internet
    </div>
  );
};

export default OfflineBanner;
