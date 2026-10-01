import { useState } from 'react';

import {
  FiHome,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiBookOpen,
  FiCreditCard,
  FiActivity,
  FiMessageCircle,
  FiGift,
} from 'react-icons/fi';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { confirmDialog } from '../ConfirmDialog';
import BottomSheetMenu, { type SheetSection } from './BottomSheetMenu';
import './BottomNavbar.css';

type Tab = 'menu' | 'transaksi';

/**
 * Rute yang dimiliki tab Transaksi dan Menu. Tanpa ini keduanya hanya menyala
 * selama sheet-nya terbuka, jadi setelah membuka mis. halaman Kasbon tidak ada
 * penanda posisi sama sekali di navigasi bawah.
 */
const RUTE_TAB: Record<Tab, string[]> = {
  transaksi: [
    '/ladies/voucher',
    '/ladies/pemasukan_lain',
    '/ladies/kasbon',
    '/ladies/dokter',
  ],
  menu: ['/ladies/profile', '/ladies/peraturan', '/smart-chat-ladies'],
};

const tabDariRute = (pathname: string): Tab | null => {
  for (const [tab, daftar] of Object.entries(RUTE_TAB)) {
    if (daftar.some((rute) => pathname === rute || pathname.startsWith(`${rute}/`))) {
      return tab as Tab;
    }
  }
  return null;
};

function BottomNavbarLadies() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState<Tab | null>(null);

  const { logout } = useAuth();

  const isActive = (path: string) =>
    location.pathname.startsWith(path);

  const tabAktif = tabDariRute(location.pathname);

  // Selama sheet terbuka, tab itulah yang menyala; kalau tidak, URL yang menentukan.
  const menyala = (tab: Tab) =>
    activeModal ? activeModal === tab : tabAktif === tab;

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    closeModal();
  };

  // Header app tidak tampil di Home & halaman riwayat ladies (mobile), jadi
  // sheet Menu adalah tempat utama untuk keluar dari akun.
  const handleLogout = async () => {
    if (!(await confirmDialog('Keluar dari akun ini?'))) return;
    closeModal();
    logout();
    navigate('/login');
  };

  const SHEET: Record<Tab, { title: string; sections: SheetSection[] }> = {
    transaksi: {
      title: 'Transaksi',
      sections: [
        {
          // Bukan "Input Transaksi": keempat halaman ini hanya menampilkan
          // riwayat — ladies tidak bisa menginput apa pun di sana.
          judul: 'Riwayat transaksi',
          items: [
            { icon: <FiGift />, label: 'Voucher', desc: 'Voucher & estimasi pendapatan', path: '/ladies/voucher' },
            { icon: <FiDollarSign />, label: 'Pemasukan Lain', desc: 'Pemasukan tambahan', path: '/ladies/pemasukan_lain' },
            { icon: <FiCreditCard />, label: 'Kasbon', desc: 'Pengambilan kasbon', path: '/ladies/kasbon' },
            { icon: <FiActivity />, label: 'Dokter', desc: 'Biaya kesehatan', path: '/ladies/dokter' },
          ],
        },
      ],
    },
    menu: {
      title: 'Menu',
      sections: [
        {
          judul: 'Akun',
          items: [
            { icon: <FiUser />, label: 'Profil', desc: 'Data diri & akun', path: '/ladies/profile' },
            { icon: <FiMessageCircle />, label: 'Smart Chat', desc: 'Tanya voucher & absen kamu', path: '/smart-chat-ladies' },
            { icon: <FiBookOpen />, label: 'Peraturan', desc: 'Aturan kerja SR', path: '/ladies/peraturan' },
          ],
        },
      ],
    },
  };

  return (
    <>
      <div className="bottom-navbar-wrapper">
        <div className="bottom-navbar">
          {/* HOME */}
          <button
            type="button"
            className={`nav-item ${
              !activeModal && isActive('/ladies/home') ? 'active' : ''
            }`}
            aria-label="Home"
            aria-current={isActive('/ladies/home') ? 'page' : undefined}
            onClick={() => {
              navigate('/ladies/home');
              closeModal();
            }}
          >
            <div className="nav-icon-wrapper">
              <FiHome className="nav-icon" />
            </div>

            <span>Home</span>
          </button>

          {/* TRANSAKSI */}
          <button
            type="button"
            className={`nav-item ${
              menyala('transaksi') ? 'active' : ''
            }`}
            aria-label="Transaksi"
            aria-expanded={activeModal === 'transaksi'}
            aria-current={tabAktif === 'transaksi' ? 'page' : undefined}
            onClick={() =>
              setActiveModal('transaksi')
            }
          >
            <div className="nav-icon-wrapper">
              <FiDollarSign className="nav-icon" />
            </div>

            <span>Transaksi</span>
          </button>

          {/* ABSENSI */}
          <button
            type="button"
            className={`nav-item ${
              !activeModal && isActive('/ladies/absensi') ? 'active' : ''
            }`}
            aria-label="Absensi"
            aria-current={isActive('/ladies/absensi') ? 'page' : undefined}
            onClick={() => {
              navigate('/ladies/absensi');
              closeModal();
            }}
          >
            <div className="nav-icon-wrapper">
              <FiCalendar className="nav-icon" />
            </div>

            <span>Absensi</span>
          </button>

          {/* MENU */}
          <button
            type="button"
            className={`nav-item ${
              menyala('menu') ? 'active' : ''
            }`}
            aria-label="Menu"
            aria-expanded={activeModal === 'menu'}
            aria-current={tabAktif === 'menu' ? 'page' : undefined}
            onClick={() => setActiveModal('menu')}
          >
            <div className="nav-icon-wrapper">
              <FiUser className="nav-icon" />
            </div>

            <span>Menu</span>
          </button>
        </div>
      </div>

      {activeModal && (
        <BottomSheetMenu
          title={SHEET[activeModal].title}
          sections={SHEET[activeModal].sections}
          isAktif={(path) => location.pathname === path || location.pathname.startsWith(`${path}/`)}
          onNavigate={handleNavigate}
          onClose={closeModal}
          onLogout={activeModal === 'menu' ? handleLogout : undefined}
        />
      )}
    </>
  );
}

export default BottomNavbarLadies;
