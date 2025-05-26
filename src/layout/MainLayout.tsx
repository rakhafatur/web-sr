import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className="flex-grow-1 d-flex flex-column"
        style={{
          marginLeft: sidebarOpen ? 250 : 0,
          transition: 'margin 0.3s ease',
          backgroundColor: '#0f001e',
          color: '#eee',
        }}
      >
        {/* Tombol hamburger di HP */}
        <div className="d-md-none p-2">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem' }}
          >
            ☰
          </button>
        </div>

        <Header />
        <main className="flex-grow-1 p-4">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;