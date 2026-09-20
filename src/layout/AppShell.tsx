import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

import Sidebar from '../components/shell/Sidebar';
import Header from '../components/Header/Header';
import BottomNavbarAdmin from '../components/Bottombar/BottomNavbarAdmin';
import BottomNavbarLadies from '../components/Bottombar/BottomNavbarLadies';
import { NAV_ADMIN, NAV_LADIES } from './navItems';

const KUNCI_RAIL = 'sr-sidebar-rail';

type Props = {
  isLadies: boolean;
  namaUser: string;
  peran: string;
  onLogout: () => void;
  children: ReactNode;
};

/**
 * Kerangka aplikasi.
 *
 * Desktop memakai sidebar baru dan TIDAK merender Header sama sekali — judul
 * halaman pindah ke konten, dan isi header pindah ke kaki sidebar.
 *
 * Mobile masih memakai Header + BottomNavbar yang lama, apa adanya.
 * Penggantinya datang di Fase 2c; memisahkannya begini yang membuat fase ini
 * bisa dikerjakan tanpa menyentuh mobile sama sekali.
 */
const AppShell = ({ isLadies, namaUser, peran, onLogout, children }: Props) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { pathname } = useLocation();

  const [rail, setRail] = useState(() => {
    try {
      return localStorage.getItem(KUNCI_RAIL) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KUNCI_RAIL, rail ? '1' : '0');
    } catch {
      // Mode privat — pilihan tetap berlaku sampai tab ditutup.
    }
  }, [rail]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Halaman beranda mengatur padding-nya sendiri (hero menyentuh tepi).
  const beranda = pathname === '/' || pathname === '/ladies/home';

  if (isMobile) {
    return (
      <div className="min-h-screen bg-canvas text-fg">
        <Header />
        <main
          className={beranda ? '' : 'p-4'}
          style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}
        >
          {children}
        </main>
        {isLadies ? <BottomNavbarLadies /> : <BottomNavbarAdmin />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-fg">
      <Sidebar
        grup={isLadies ? NAV_LADIES : NAV_ADMIN}
        collapsed={rail}
        onToggleCollapse={() => setRail((v) => !v)}
        namaUser={namaUser}
        peran={peran}
        onLogout={onLogout}
      />

      {/* Tanpa min-height 100vh di sini: versi lama memasangnya di bawah
          header sticky 68px, sehingga halaman selalu lebih tinggi dari
          viewport dan scrollbar vertikal muncul terus. */}
      {/* Offset sidebar pakai MARGIN, bukan padding: `pl-*` dan `px-*`
          sama-sama menyetel padding kiri, dan pemenangnya ditentukan urutan
          aturan di stylesheet — bukan urutan kelas di sini. */}
      <main
        className={[
          'transition-[margin] duration-200',
          rail ? 'ml-14' : 'ml-60',
          beranda ? '' : 'px-6 py-6 xl:px-8',
        ].join(' ')}
      >
        <div className="page-shell">{children}</div>
      </main>
    </div>
  );
};

export default AppShell;
