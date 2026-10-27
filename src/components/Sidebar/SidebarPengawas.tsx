import { useMemo } from 'react';
import { useMenuNonaktif } from '../../hooks/useMenu';
import { HALAMAN_PENGAWAS, SIDEBAR_PENGAWAS } from '../../layout/menu';
import { saringSidebar } from '../../layout/saringMenu';
import SidebarNav from './SidebarNav';
import { keMenuSidebar } from './menuSidebar';

type Props = {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
};

/** Sidebar desktop untuk role pengawas — tampilan & perilaku sama dengan admin. */
function SidebarPengawas({ isCollapsed, onToggleCollapse }: Props) {
  const nonaktif = useMenuNonaktif();
  const menu = useMemo(
    () => keMenuSidebar(HALAMAN_PENGAWAS, saringSidebar(HALAMAN_PENGAWAS, SIDEBAR_PENGAWAS, 'pengawas', nonaktif)),
    [nonaktif]
  );

  return (
    <SidebarNav
      menu={menu}
      label="Menu pengawas"
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
    />
  );
}

export default SidebarPengawas;
