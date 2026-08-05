import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { FiBell, FiGift, FiCreditCard, FiHeart, FiDollarSign } from 'react-icons/fi';
import { useLadiesNotifications, type NotifTipe } from '../../hooks/useLadiesNotifications';

const TIPE_ICON: Record<NotifTipe, React.ReactNode> = {
  voucher: <FiGift />,
  kasbon: <FiCreditCard />,
  dokter: <FiHeart />,
  pemasukan_lain: <FiDollarSign />,
};

const TIPE_COLOR: Record<NotifTipe, string> = {
  voucher: 'var(--color-voucher)',
  kasbon: 'var(--color-expense)',
  dokter: 'var(--color-medical)',
  pemasukan_lain: 'var(--color-income)',
};

const formatRelativeTime = (iso: string) => {
  const now = dayjs();
  const target = dayjs(iso);

  const diffMin = now.diff(target, 'minute');
  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;

  const diffHour = now.diff(target, 'hour');
  if (diffHour < 24) return `${diffHour} jam lalu`;

  const diffDay = now.diff(target, 'day');
  if (diffDay < 7) return `${diffDay} hari lalu`;

  return target.format('DD MMM YYYY');
};

type Props = {
  ladiesId: string;
};

const NotificationBell = ({ ladiesId }: Props) => {
  const { items, unreadCount, lastSeenAt, markAllSeen } = useLadiesNotifications(ladiesId);
  const [open, setOpen] = useState(false);
  const [viewingSince, setViewingSince] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!open) {
      // Bekukan batas "belum dibaca" versi saat dibuka, supaya item yang baru
      // masih tersorot untuk sesi lihat ini — walau markAllSeen() di bawah
      // langsung update batas yang tersimpan untuk kunjungan berikutnya.
      setViewingSince(lastSeenAt);
      markAllSeen();
    }

    setOpen((prev) => !prev);
  };

  return (
    <div className="notif-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="notif-btn"
        onClick={handleToggle}
        aria-label="Notifikasi"
      >
        <FiBell />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      <div className={`notif-panel ${open ? 'show' : ''}`}>
        <div className="notif-panel-header">Notifikasi</div>

        <div className="notif-list">
          {items.length === 0 ? (
            <div className="notif-empty">Belum ada aktivitas terbaru</div>
          ) : (
            items.map((item) => {
              const isUnread = viewingSince ? dayjs(item.createdAt).isAfter(viewingSince) : false;

              return (
                <div key={item.id} className={`notif-item ${isUnread ? 'unread' : ''}`}>
                  <div className="notif-item-icon" style={{ color: TIPE_COLOR[item.tipe] }}>
                    {TIPE_ICON[item.tipe]}
                  </div>

                  <div>
                    <div className="notif-item-message">{item.message}</div>
                    <div className="notif-item-time">{formatRelativeTime(item.createdAt)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationBell;
