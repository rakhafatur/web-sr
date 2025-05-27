import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useLocation } from 'react-router-dom';

function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth < 768;
      setIsMobile(isNowMobile);
      setSidebarOpen(!isNowMobile);
    };

    handleResize(); // run once
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    // only disable horizontal scroll
    document.body.style.overflowX = 'hidden';
    return () => {
      document.body.style.overflowX = '';
    };
  }, []);

  return (
    <div className="d-flex" style={{ minHeight: '100vh', width: '100%' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />

      <div
        className="flex-grow-1 d-flex flex-column"
        style={{
          marginLeft: !isMobile && sidebarOpen ? 250 : 0,
          transition: 'margin 0.3s ease',
          backgroundColor: '#0f001e',
          color: '#eee',
          width: '100%',
        }}
      >
        {isMobile && (
          <div className="p-2">
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
              }}
            >
              ☰
            </button>
          </div>
        )}

        <Header />

        <main
          className="p-4"
          style={{
            flex: 1,
            overflowX: 'auto',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;