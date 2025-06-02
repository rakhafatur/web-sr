import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useLocation } from 'react-router-dom';
import { HEADER_HEIGHT, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../constant';

function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth < 768;
      setIsMobile(isNowMobile);
      setSidebarOpen(!isNowMobile);
      setIsCollapsed(false); // reset collapse saat pindah ke mobile
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflowX = 'hidden';
    return () => {
      document.body.style.overflowX = '';
    };
  }, []);

  const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <div className="layout-container">
      <div className="d-flex" style={{ flex: 1, width: '100%' }}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        <div
          className="flex-grow-1 d-flex flex-column"
          style={{
            marginLeft: !isMobile && sidebarOpen ? sidebarWidth : 0,
            transition: 'margin 0.3s ease',
            backgroundColor: '#0f001e',
            color: '#eee',
            width: '100%',
          }}
        >
          {/* Header dikasih prop buat buka sidebar */}
          <Header onToggleSidebar={() => setSidebarOpen(true)} />

          <main className="main-content" style={{ paddingTop: `${HEADER_HEIGHT}px` }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
