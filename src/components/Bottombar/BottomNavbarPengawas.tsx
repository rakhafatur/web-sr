import { useMemo } from 'react';
import { useMenuNonaktif } from '../../hooks/useMenu';
import { HALAMAN_PENGAWAS, NAVBAR_PENGAWAS } from '../../layout/menu';
import { saringNavbar } from '../../layout/saringMenu';
import BottomNavbar from './BottomNavbar';

/** Navbar bawah pengawas — isi tab & sheet-nya di layout/menu.tsx. */
function BottomNavbarPengawas() {
  const nonaktif = useMenuNonaktif();
  const tabs = useMemo(() => saringNavbar(HALAMAN_PENGAWAS, NAVBAR_PENGAWAS, 'pengawas', nonaktif), [nonaktif]);

  return <BottomNavbar halaman={HALAMAN_PENGAWAS} tabs={tabs} />;
}

export default BottomNavbarPengawas;
