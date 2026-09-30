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
  // Smart Chat ladies di mobile tampil layar penuh (bar atas & dok pertanyaan
  // milik halaman itu sendiri), jadi header, navbar bawah, dan padding dicabut.
  const isChatLayarPenuh = isMobile && location.pathname === '/smart-chat-ladies';
  const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <div
      className="layout-container"
      // Chat layar penuh mengatur tingginya sendiri (100dvh); 100vh di Safari
      // lebih tinggi dari layar terlihat dan membuat halaman bisa ter-scroll.
      style={{ backgroundColor: 'var(--color-bg)', minHeight: isChatLayarPenuh ? undefined : '100vh' }}
    >
      {/* Home Ladies di mobile tanpa header (pola referensi): avatar, lonceng,
          dan sapaan jadi bagian halaman itu sendiri — lihat HomeLadiesPage. */}
      {!(isMobile && isLadies && location.pathname === '/ladies/home') && !isChatLayarPenuh && <Header />}

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
              minHeight: isChatLayarPenuh ? undefined : '100vh',
              padding: isHomePage || isChatLayarPenuh ? '0' : '2rem',
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