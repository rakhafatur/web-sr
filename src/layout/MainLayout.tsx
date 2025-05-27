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

    handleResize(); // jalankan saat pertama kali load
    window.addEventListener('resize', handleResize); // update saat resize

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Scroll ke atas setiap kali pindah halaman
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div
      className="d-flex"
      style={{
        minHeight: '100vh',
        overflowX: 'hidden', // cegah scroll horizontal
      }}
    >
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
        {/* Tombol hamburger hanya di HP */}
        {isMobile && (
          <div className="p-2">
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                transition: 'transform 0.2s ease',
              }}
            >
              ☰
            </button>
          </div>
        )}

        <Header />
        <main className="flex-grow-1 p-4" style={{ overflowX: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;