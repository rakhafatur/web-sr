import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '../app/store';

import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import BottomNavbarAdmin from '../components/Bottombar/BottomNavbarAdmin';
import BottomNavbarLadies from '../components/Bottombar/BottomNavbarLadies';

import {
  SIDEBAR_WIDTH,
  SIDEBAR_COLLAPSED_WIDTH,
} from '../constant';

const RUTE_LADIES_TANPA_HEADER = [
  '/ladies/home',
  '/ladies/voucher',
  '/ladies/kasbon',
  '/ladies/dokter',
  '/ladies/pemasukan_lain',
  '/ladies/absensi',
  '/ladies/profile',
  '/ladies/peraturan',
];

/** Halaman admin yang di mobile punya bar atas sendiri (MobilePageBar).
    Entri yang diakhiri '/' dicocokkan sebagai awalan (rute ber-parameter,
    mis. '/user-detail/' untuk '/user-detail/:id'). */
const RUTE_ADMIN_TANPA_HEADER = [
  '/',
  '/add-transaksi',
  '/add-transaksi-pengawas',
  '/buku-kuning',
  '/buku-kuning-pengawas',
  '/outlet',
  '/users',
  '/user-create',
  '/user-approval',
  '/user-detail/',
  '/pengawas',
  '/pengawas-create',
  '/pengawas-detail/',
  '/agent',
  '/agent-create',
  '/agent-detail/',
  '/ladies',
  '/ladies-create',
  '/ladies-detail/',
  '/absensi',
  '/rekap-voucher',
  '/performa-ladies',
];

const cocokRute = (daftar: string[], pathname: string) =>
  daftar.some((r) => (r.endsWith('/') && r !== '/' ? pathname.startsWith(r) : pathname === r));

function MainLayout({ children }: { children: React.ReactNode }) {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const isLadies = !!user?.ladies_id;

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const nowMobile = window.innerWidth < 768;
      setIsMobile(nowMobile);
      setSidebarOpen(!nowMobile);
      setIsCollapsed(false);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isHomePage = location.pathname === '/' || location.pathname === '/ladies/home';
  // Smart Chat (ladies & admin) mengisi penuh area konten, jadi padding dan
  // min-height main dicabut di semua ukuran. Di mobile tampil layar penuh:
  // header & navbar bawah ikut dicabut (bar atas & dok milik halaman itu).
  const isRuteChat = location.pathname === '/smart-chat-ladies' || location.pathname === '/smart-chat';
  const isChatLayarPenuh = isMobile && isRuteChat;
  // Halaman yang di mobile punya bar atas sendiri (pola referensi), jadi
  // Header app dan padding main dicabut — lihat MobilePageBar. Navbar bawah
  // tetap tampil.
  const isTanpaHeader = isMobile && (
    isLadies
      ? cocokRute(RUTE_LADIES_TANPA_HEADER, location.pathname)
      : cocokRute(RUTE_ADMIN_TANPA_HEADER, location.pathname)
  );
  const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <div
      className="layout-container"
      // Chat layar penuh mengatur tingginya sendiri (100dvh); 100vh di Safari
      // lebih tinggi dari layar terlihat dan membuat halaman bisa ter-scroll.
      style={{ backgroundColor: 'var(--color-bg)', minHeight: isChatLayarPenuh ? undefined : '100vh' }}
    >
      {!isTanpaHeader && !isChatLayarPenuh && <Header />}

      <div className="d-flex" style={{ width: '100%' }}>
        {!isMobile && (
          isLadies ? (
            <div style={{ width: sidebarWidth, padding: '1rem' }}>
              <div style={{ fontWeight: 600 }}>SR Ladies</div>
              <div style={{ marginTop: '0.5rem' }}>Sidebar khusus ladies belum tersedia</div>
            </div>
          ) : (
            <Sidebar
              isCollapsed={isCollapsed}
              onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />
          )
        )}

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
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {isMobile && !isChatLayarPenuh && (isLadies ? <BottomNavbarLadies /> : <BottomNavbarAdmin />)}
    </div>
  );
}

export default MainLayout;