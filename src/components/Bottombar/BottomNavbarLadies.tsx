import { HALAMAN_LADIES, NAVBAR_LADIES } from '../../layout/menu';
import BottomNavbar from './BottomNavbar';

/** Navbar bawah ladies — isi tab & sheet-nya di layout/menu.tsx. */
function BottomNavbarLadies() {
  return <BottomNavbar halaman={HALAMAN_LADIES} tabs={NAVBAR_LADIES} />;
}

export default BottomNavbarLadies;
