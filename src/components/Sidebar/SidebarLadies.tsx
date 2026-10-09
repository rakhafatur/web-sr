import SidebarNav from './SidebarNav';
import { MENU_LADIES } from './menuSidebar';

type Props = {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
};

/** Sidebar desktop untuk role ladies — tampilan & perilaku sama dengan admin. */
function SidebarLadies({ isCollapsed, onToggleCollapse }: Props) {
  return (
    <SidebarNav
      menu={MENU_LADIES}
      label="Menu ladies"
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
    />
  );
}

export default SidebarLadies;
