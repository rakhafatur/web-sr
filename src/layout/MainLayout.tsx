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
  const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <div
      className="layout-container"
      style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}
    >
      <Header />

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
              minHeight: '100vh',
              padding: isHomePage ? '0' : '2rem',
              paddingBottom: isMobile
                ? 'calc(80px + env(safe-area-inset-bottom))'
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

      {isMobile && (isLadies ? <BottomNavbarLadies /> : <BottomNavbarAdmin />)}
    </div>
  );
}

export default MainLayout;