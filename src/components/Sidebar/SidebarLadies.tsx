import { useMemo } from 'react';
import { useMenuNonaktif } from '../../hooks/useMenu';
import { HALAMAN_LADIES, SIDEBAR_LADIES } from '../../layout/menu';
import { saringSidebar } from '../../layout/saringMenu';
import SidebarNav from './SidebarNav';
import { keMenuSidebar } from './menuSidebar';

type Props = {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
};

/** Sidebar desktop untuk role ladies — tampilan & perilaku sama dengan admin. */
function SidebarLadies({ isCollapsed, onToggleCollapse }: Props) {
  const nonaktif = useMenuNonaktif();
  const menu = useMemo(
    () => keMenuSidebar(HALAMAN_LADIES, saringSidebar(HALAMAN_LADIES, SIDEBAR_LADIES, 'ladies', nonaktif)),
    [nonaktif]
  );

  return (
    <SidebarNav
      menu={menu}
      label="Menu ladies"
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
    />
  );
}

export default SidebarLadies;
