import { useQuery } from '@tanstack/react-query';

import { supabase } from '../../lib/supabaseClient';
import SidebarNav from './SidebarNav';
import { MENU_ADMIN } from './menuSidebar';

type SidebarProps = {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
};

/** Sidebar desktop admin. Badge di "Persetujuan User" = jumlah pendaftar yang
    menunggu (users.is_active = false, sama dengan daftar di UserApprovalPage). */
function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  // Kunci diawali 'user-approval' supaya ikut diperbarui saat UserApprovalPage
  // menyetujui/menolak (invalidate ['user-approval']).
  const { data: jumlahPendaftar = 0 } = useQuery({
    queryKey: ['user-approval', 'jumlah'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', false);

      if (error) throw error;
      return count ?? 0;
    },
    // Sidebar tidak pernah di-mount ulang saat pindah halaman, jadi pendaftar
    // baru baru terlihat lewat refetch berkala.
    refetchInterval: 60_000,
    meta: { errorLabel: 'jumlah pendaftar', senyap: true },
  });

  return (
    <SidebarNav
      menu={MENU_ADMIN}
      label="Menu admin"
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      badge={{ '/user-approval': jumlahPendaftar }}
    />
  );
}

export default Sidebar;
