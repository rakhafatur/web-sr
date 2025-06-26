import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import BottomNavbarAdmin from '../components/Bottombar/BottomNavbarAdmin';

import {
  SIDEBAR_WIDTH,
  SIDEBAR_COLLAPSED_WIDTH,
} from '../constant';

function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
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

  const isHomePage = location.pathname === '/';
  const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <div
      className="layout-container"
      style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}
    >
      {/* ✅ Header tampil di semua mode */}
      <Header />

      <div className="d-flex" style={{ width: '100%' }}>
        {/* ✅ Sidebar hanya untuk non-mobile */}
        {!isMobile && (
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isMobile={false}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          />
        )}

        {/* ✅ Main Content */}
        <div
          className="flex-grow-1 d-flex flex-column"
          style={{
            marginLeft: isHomePage
              ? 0
              : !isMobile && sidebarOpen
              ? sidebarWidth
              : 0,
            transition: 'margin 0.3s ease',
            width: '100%',
          }}
        >
          <main
            className="main-content"
            style={{
              padding: isHomePage ? '0' : '2rem',
              paddingBottom: isMobile ? '80px' : undefined, // untuk BottomNavbar
            }}
          >
            {children}
          </main>
        </div>
      </div>

      {/* ✅ BottomNavbar untuk mobile */}
      {isMobile && <BottomNavbarAdmin />}
    </div>
  );
}

export default MainLayout;