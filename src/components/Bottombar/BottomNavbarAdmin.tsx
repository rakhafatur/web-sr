import { useState } from 'react';
import {
  FiHome,
  FiDollarSign,
  FiBarChart2,
  FiMenu,
  FiUsers,
  FiUser,
  FiUserCheck,
  FiClipboard,
  FiTrendingUp,
  FiMessageCircle,
  FiBookOpen,
  FiShield,
  FiActivity,
  FiBriefcase,
  FiMapPin,
} from 'react-icons/fi';

import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { confirmDialog } from '../ConfirmDialog';
import BottomSheetMenu, { type SheetSection } from './BottomSheetMenu';

import './BottomNavbar.css';

type Tab = 'transaksi' | 'report' | 'menu';

/**
 * Rute yang dimiliki tiap tab. Dipakai untuk menyalakan penanda halaman aktif
 * dari URL: sebelumnya tab Transaksi/Report/Menu hanya menyala selama sheet-nya
 * masih terbuka, jadi begitu berpindah halaman tidak ada penanda apa pun dan
 * user kehilangan jejak posisinya.
 *
 * Ditulis lengkap per rute karena halaman Tambah & Detail memakai akhiran
 * (`/ladies-create`, `/ladies-detail/:id`), bukan sub-path — jadi mencocokkan
 * awalan `/ladies` saja tidak cukup.
 */
const RUTE_TAB: Record<Tab, string[]> = {
  transaksi: [
    '/add-transaksi',
    '/add-transaksi-pengawas',
    '/buku-kuning',
    '/buku-kuning-pengawas',
  ],
  report: ['/absensi', '/rekap-voucher', '/performa-ladies'],
  menu: [
    '/users',
    '/user-create',
    '/user-approval',
    '/user-detail',
    '/pengawas',
    '/pengawas-create',
    '/pengawas-detail',
    '/ladies',
    '/ladies-create',
    '/ladies-detail',
    '/agent',
    '/agent-create',
    '/agent-detail',
    '/outlet',
    '/smart-chat',
  ],
};

/**
 * Cocok kalau rutenya sama persis atau merupakan induk langsung — bukan sekadar
 * berawalan sama. Tanpa syarat itu `/smart-chat` akan ikut menyala di halaman
 * ladies `/smart-chat-ladies`.
 */
const cocok = (pathname: string, rute: string) =>
  pathname === rute || pathname.startsWith(`${rute}/`);

const tabDariRute = (pathname: string): Tab | null => {
  for (const [tab, daftar] of Object.entries(RUTE_TAB)) {
    if (daftar.some((rute) => cocok(pathname, rute))) return tab as Tab;
  }
  return null;
};

/** Halaman Tambah/Detail milik tiap item menu — supaya item tetap menyala
    saat membuka mis. `/ladies-detail/:id`, bukan hanya di `/ladies`. */
const TURUNAN: Record<string, string[]> = {
  '/users': ['/user-create', '/user-detail'],
  '/pengawas': ['/pengawas-create', '/pengawas-detail'],
  '/ladies': ['/ladies-create', '/ladies-detail'],
  '/agent': ['/agent-create', '/agent-detail'],
};

const itemAktif = (pathname: string, path: string) =>
  [path, ...(TURUNAN[path] ?? [])].some((rute) => cocok(pathname, rute));

function BottomNavbarAdmin() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState<Tab | null>(null);

  const tabAktif = tabDariRute(location.pathname);
  const diHome = location.pathname === '/';

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

  const { logout } = useAuth();

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
          judul: 'Ladies',
          items: [
            { icon: <FiDollarSign />, label: 'Transaksi Ladies', desc: 'Catat transaksi baru', path: '/add-transaksi' },
            { icon: <FiBookOpen />, label: 'Buku Kuning Ladies', desc: 'Riwayat & saldo berjalan', path: '/buku-kuning' },
          ],
        },
        {
          judul: 'Pengawas',
          items: [
            { icon: <FiDollarSign />, label: 'Transaksi Pengawas', desc: 'Catat transaksi baru', path: '/add-transaksi-pengawas' },
            { icon: <FiBookOpen />, label: 'Buku Kuning Pengawas', desc: 'Riwayat & saldo berjalan', path: '/buku-kuning-pengawas' },
          ],
        },
      ],
    },
    report: {
      title: 'Laporan',
      sections: [
        {
          items: [
            { icon: <FiClipboard />, label: 'Absensi', desc: 'Kehadiran ladies', path: '/absensi' },
            { icon: <FiTrendingUp />, label: 'Rekap Voucher', desc: 'Rekap voucher per periode', path: '/rekap-voucher' },
            { icon: <FiActivity />, label: 'Performa Ladies', desc: 'Perbandingan performa ladies', path: '/performa-ladies' },
          ],
        },
      ],
    },
    menu: {
      title: 'Menu',
      sections: [
        {
          judul: 'Data master',
          items: [
            { icon: <FiUsers />, label: 'Users', desc: 'Akun pengguna', path: '/users' },
            { icon: <FiShield />, label: 'Approval User', desc: 'Persetujuan akun baru', path: '/user-approval' },
            { icon: <FiUserCheck />, label: 'Pengawas', desc: 'Data pengawas', path: '/pengawas' },
            { icon: <FiUser />, label: 'Ladies', desc: 'Data ladies', path: '/ladies' },
            { icon: <FiBriefcase />, label: 'Agent', desc: 'Data agent', path: '/agent' },
            { icon: <FiMapPin />, label: 'Outlet', desc: 'Data outlet', path: '/outlet' },
          ],
        },
        {
          judul: 'Asisten',
          items: [
            { icon: <FiMessageCircle />, label: 'Chat SR', desc: 'Tanya statistik & insight', path: '/smart-chat' },
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
              !activeModal && diHome ? 'active' : ''
            }`}
            aria-label="Home"
            aria-current={diHome ? 'page' : undefined}
            onClick={() => {
              navigate('/');
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

          {/* REPORT */}
          <button
            type="button"
            className={`nav-item ${
              menyala('report') ? 'active' : ''
            }`}
            aria-label="Report"
            aria-expanded={activeModal === 'report'}
            aria-current={tabAktif === 'report' ? 'page' : undefined}
            onClick={() => setActiveModal('report')}
          >
            <div className="nav-icon-wrapper">
              <FiBarChart2 className="nav-icon" />
            </div>

            <span>Report</span>
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
              <FiMenu className="nav-icon" />
            </div>

            <span>Menu</span>
          </button>
        </div>
      </div>

      {activeModal && (
        <BottomSheetMenu
          title={SHEET[activeModal].title}
          sections={SHEET[activeModal].sections}
          isAktif={(path) => itemAktif(location.pathname, path)}
          onNavigate={handleNavigate}
          onClose={closeModal}
          onLogout={activeModal === 'menu' ? handleLogout : undefined}
        />
      )}
    </>
  );
}

export default BottomNavbarAdmin;