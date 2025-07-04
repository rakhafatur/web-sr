import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
  const user = useSelector((state: RootState) => state.user.currentUser) as any;
  const isLadies = !!user?.ladies_id;

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
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              isMobile={false}
              isCollapsed={isCollapsed}
              onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />
          )
        )}

        <div
          className="flex-grow-1 d-flex flex-column"
          style={{
            marginLeft: isHomePage ? 0 : !isMobile && sidebarOpen ? sidebarWidth : 0,
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
              paddingBottom: isMobile ? '80px' : undefined,
            }}
          >
            {children}
          </main>
        </div>
      </div>

      {isMobile && (isLadies ? <BottomNavbarLadies /> : <BottomNavbarAdmin />)}
    </div>
  );
}

export default MainLayout;