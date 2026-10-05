import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiGift,
  FiDollarSign,
  FiCreditCard,
  FiActivity,
  FiCalendar,
  FiUser,
  FiMessageCircle,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../../constant';
import './Sidebar.css';

type Props = {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
};

type Item = { to: string; label: string; icon: React.ReactNode };
type Bagian = { judul?: string; items: Item[] };

/** Menu ladies — sama dengan navbar bawah + sheet Transaksi/Menu di mobile. */
const BAGIAN: Bagian[] = [
  { items: [{ to: '/ladies/home', label: 'Home', icon: <FiHome /> }] },
  {
    judul: 'Transaksi',
    items: [
      { to: '/ladies/voucher', label: 'Voucher', icon: <FiGift /> },
      { to: '/ladies/pemasukan_lain', label: 'Pemasukan Lain', icon: <FiDollarSign /> },
      { to: '/ladies/kasbon', label: 'Kasbon', icon: <FiCreditCard /> },
      { to: '/ladies/dokter', label: 'Dokter', icon: <FiActivity /> },
    ],
  },
  { items: [{ to: '/ladies/absensi', label: 'Absensi', icon: <FiCalendar /> }] },
  {
    judul: 'Akun',
    items: [
      { to: '/ladies/profile', label: 'Profil', icon: <FiUser /> },
      { to: '/smart-chat-ladies', label: 'Smart Chat', icon: <FiMessageCircle /> },
      { to: '/ladies/peraturan', label: 'Peraturan', icon: <FiBookOpen /> },
    ],
  },
];

/**
 * Sidebar desktop untuk role ladies (sebelumnya placeholder "belum
 * tersedia"). Gaya & perilaku ciut sama dengan Sidebar admin.
 */
function SidebarLadies({ isCollapsed, onToggleCollapse }: Props) {
  const { pathname } = useLocation();
  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <nav
      className="sidebar d-flex flex-column p-3"
      style={{ width: `${isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH}px` }}
      aria-label="Menu ladies"
    >
      <button
        type="button"
        onClick={onToggleCollapse}
        className="sidebar-toggle-btn"
        title={isCollapsed ? 'Lebarkan sidebar' : 'Ciutkan sidebar'}
        aria-label={isCollapsed ? 'Lebarkan sidebar' : 'Ciutkan sidebar'}
      >
        {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
      </button>

      <ul className="nav flex-column gap-1 sidebar-nav">
        {BAGIAN.map((bagian, i) => (
          <li key={bagian.judul ?? `bagian-${i}`}>
            {bagian.judul && !isCollapsed && <div className="sidebar-section">{bagian.judul}</div>}
            <ul className="nav flex-column gap-1">
              {bagian.items.map((item) => {
                const aktif = isActive(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={`nav-link sidebar-link ${aktif ? 'active' : ''}`}
                      aria-current={aktif ? 'page' : undefined}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <span className="sidebar-icon d-flex" aria-hidden>{item.icon}</span>
                      {!isCollapsed && <span className="ms-2">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default SidebarLadies;
