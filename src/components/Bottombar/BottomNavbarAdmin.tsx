import { HALAMAN_ADMIN, NAVBAR_ADMIN } from '../../layout/menu';
import BottomNavbar from './BottomNavbar';

/** Navbar bawah admin — isi tab & sheet-nya di layout/menu.tsx. */
function BottomNavbarAdmin() {
  return <BottomNavbar halaman={HALAMAN_ADMIN} tabs={NAVBAR_ADMIN} />;
}

export default BottomNavbarAdmin;
