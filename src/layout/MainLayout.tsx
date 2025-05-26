import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column">
        <Header /> {/* 👉 Tambahkan di atas */}
        <main className="flex-grow-1 p-4" style={{ backgroundColor: '#0f001e', color: '#eee' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;