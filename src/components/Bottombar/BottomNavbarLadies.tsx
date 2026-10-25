import { useMemo } from 'react';
import { useMenuNonaktif } from '../../hooks/useMenu';
import { HALAMAN_LADIES, NAVBAR_LADIES } from '../../layout/menu';
import { saringNavbar } from '../../layout/saringMenu';
import BottomNavbar from './BottomNavbar';

/** Navbar bawah ladies — isi tab & sheet-nya di layout/menu.tsx. */
function BottomNavbarLadies() {
  const nonaktif = useMenuNonaktif();
  const tabs = useMemo(() => saringNavbar(HALAMAN_LADIES, NAVBAR_LADIES, 'ladies', nonaktif), [nonaktif]);

  return <BottomNavbar halaman={HALAMAN_LADIES} tabs={tabs} />;
}

export default BottomNavbarLadies;
