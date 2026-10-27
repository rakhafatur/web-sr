import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '../app/store';

import Sidebar from '../components/Sidebar/Sidebar';
import SidebarLadies from '../components/Sidebar/SidebarLadies';
import SidebarPengawas from '../components/Sidebar/SidebarPengawas';
import Header from '../components/Header/Header';
import BottomNavbarAdmin from '../components/Bottombar/BottomNavbarAdmin';
import BottomNavbarLadies from '../components/Bottombar/BottomNavbarLadies';
import BottomNavbarPengawas from '../components/Bottombar/BottomNavbarPengawas';

import {
  SIDEBAR_WIDTH,
  SIDEBAR_COLLAPSED_WIDTH,
} from '../constant';
import { cocokRute } from '../utils/cocokRute';
// Halaman yang di mobile punya bar atas sendiri (MobilePageBar) — diturunkan
// dari `barSendiri` di daftar menu, bukan ditulis ulang di sini.
import {
  HALAMAN_ADMIN,
  HALAMAN_LADIES,
  HALAMAN_PENGAWAS,
  RUTE_ADMIN_TANPA_HEADER,
  RUTE_LADIES_TANPA_HEADER,
  RUTE_PENGAWAS_TANPA_HEADER,
  type Halaman,
} from './menu';
import { halamanNonaktifDi } from './saringMenu';
import { BERANDA, peranDari, type Peran } from './peran';
import { useMenuNonaktif } from '../hooks/useMenu';
import MenuNonaktif from '../components/MenuNonaktif';

/** Daftar halaman, rute tanpa Header, sidebar, dan navbar bawah per peran. */
const TATA_PERAN: Record<
  Peran,
  {
    halaman: Record<string, Halaman>;
    ruteTanpaHeader: string[];
    Sidebar: typeof Sidebar;
    Navbar: () => React.ReactNode;
  }
> = {
  admin: { halaman: HALAMAN_ADMIN, ruteTanpaHeader: RUTE_ADMIN_TANPA_HEADER, Sidebar, Navbar: BottomNavbarAdmin },
  ladies: {
    halaman: HALAMAN_LADIES,
    ruteTanpaHeader: RUTE_LADIES_TANPA_HEADER,
    Sidebar: SidebarLadies,
    Navbar: BottomNavbarLadies,
  },
  pengawas: {
    halaman: HALAMAN_PENGAWAS,
    ruteTanpaHeader: RUTE_PENGAWAS_TANPA_HEADER,
    Sidebar: SidebarPengawas,
    Navbar: BottomNavbarPengawas,
  },
};

// Status ciut sidebar desktop diingat per perangkat. localStorage bisa
// melempar (mode privat, data situs diblokir) — kegagalan cukup diabaikan.
const KUNCI_SIDEBAR_CIUT = 'sr-sidebar-ciut';

const bacaSidebarCiut = () => {
  try {
    return window.localStorage.getItem(KUNCI_SIDEBAR_CIUT) === '1';
  } catch {
    return false;
  }
};

const tulisSidebarCiut = (ciut: boolean) => {
  try {
    window.localStorage.setItem(KUNCI_SIDEBAR_CIUT, ciut ? '1' : '0');
  } catch {
    /* abaikan — lihat bacaSidebarCiut */
  }
};

function MainLayout({ children }: { children: React.ReactNode }) {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const peran = peranDari(user);
  const tata = TATA_PERAN[peran];

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [isCollapsed, setIsCollapsed] = useState(bacaSidebarCiut);
  const location = useLocation();

  const toggleSidebar = () => setIsCollapsed((ciut) => !ciut);

  useEffect(() => {
    tulisSidebarCiut(isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    const handleResize = () => {
      const nowMobile = window.innerWidth < 768;
      setIsMobile(nowMobile);
      setSidebarOpen(!nowMobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Home mengatur jaraknya sendiri (padding main 0). Home ladies & pengawas
  // di desktop memakai gaya dk- seperti halaman lain, jadi tetap dapat
  // padding 2rem.
  const isHomePage =
    location.pathname === '/' || (isMobile && peran !== 'admin' && location.pathname === BERANDA[peran]);
  // Smart Chat (ladies & admin) mengisi penuh area konten, jadi padding dan
  // min-height main dicabut di semua ukuran. Di mobile tampil layar penuh:
  // header & navbar bawah ikut dicabut (bar atas & dok milik halaman itu).
  const isRuteChat = location.pathname === '/smart-chat-ladies' || location.pathname === '/smart-chat';
  const isChatLayarPenuh = isMobile && isRuteChat;
  // Halaman yang di mobile punya bar atas sendiri (pola referensi), jadi
  // Header app dan padding main dicabut — lihat MobilePageBar. Navbar bawah
  // tetap tampil.
  const isTanpaHeader = isMobile && cocokRute(tata.ruteTanpaHeader, location.pathname);
  const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  // Menu yang dinonaktifkan di Pengaturan juga ditolak saat dibuka lewat URL
  // langsung — bukan hanya disembunyikan dari sidebar/navbar.
  const nonaktif = useMenuNonaktif();
  const halamanTertutup = halamanNonaktifDi(tata.halaman, peran, nonaktif, location.pathname);

  return (
    <div
      className="layout-container"
      // Chat layar penuh mengatur tingginya sendiri (100dvh); 100vh di Safari
      // lebih tinggi dari layar terlihat dan membuat halaman bisa ter-scroll.
      style={{ backgroundColor: 'var(--color-bg)', minHeight: isChatLayarPenuh ? undefined : '100vh' }}
    >
      {!isTanpaHeader && !isChatLayarPenuh && <Header />}

      <div className="d-flex" style={{ width: '100%' }}>
        {!isMobile && <tata.Sidebar isCollapsed={isCollapsed} onToggleCollapse={toggleSidebar} />}

        <div
          className="flex-grow-1 d-flex flex-column"
          style={{
            marginLeft: !isMobile && sidebarOpen ? sidebarWidth : 0,
            transition: 'margin 0.3s ease',
            width: '100%',
          }}
        >
          <main
            className="main-content"
            style={{
              flex: 1,
              minHeight: isRuteChat ? undefined : '100vh',
              padding: isHomePage || isRuteChat || isTanpaHeader ? '0' : '2rem',
              paddingBottom: isChatLayarPenuh
                ? 0
                : isMobile
                  ? 'calc(96px + env(safe-area-inset-bottom))'
                  : undefined,
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {halamanTertutup ? (
                  <MenuNonaktif halaman={halamanTertutup} beranda={BERANDA[peran]} untukAdmin={peran === 'admin'} />
                ) : (
                  children
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {isMobile && !isChatLayarPenuh && <tata.Navbar />}
    </div>
  );
}

export default MainLayout;