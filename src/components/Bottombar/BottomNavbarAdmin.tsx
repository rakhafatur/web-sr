import { useMemo } from 'react';
import { useMenuNonaktif } from '../../hooks/useMenu';
import { HALAMAN_ADMIN, NAVBAR_ADMIN } from '../../layout/menu';
import { saringNavbar } from '../../layout/saringMenu';
import BottomNavbar from './BottomNavbar';

/** Navbar bawah admin — isi tab & sheet-nya di layout/menu.tsx. */
function BottomNavbarAdmin() {
  const nonaktif = useMenuNonaktif();
  const tabs = useMemo(() => saringNavbar(HALAMAN_ADMIN, NAVBAR_ADMIN, 'admin', nonaktif), [nonaktif]);

  return <BottomNavbar halaman={HALAMAN_ADMIN} tabs={tabs} />;
}

export default BottomNavbarAdmin;
