import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { RootState } from '../app/store';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import AppShell from './AppShell';

/**
 * Menyuntikkan identitas pengguna ke AppShell.
 *
 * Pengambilan nama tampilan mengikuti perilaku Header lama persis: ladies
 * memakai `nama_ladies`, pengawas memakai `nama_panggilan`, selebihnya
 * memakai `nama` di baris user.
 */
function MainLayout({ children }: { children: React.ReactNode }) {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const isLadies = !!currentUser?.ladies_id;

  const [namaUser, setNamaUser] = useState('User');
  const [peran, setPeran] = useState('User');

  useEffect(() => {
    let batal = false;

    const ambil = async () => {
      if (!user) return;

      const { data: grup } = await supabase
        .from('user_group')
        .select('group_name')
        .eq('id', user.user_group_id)
        .single();

      if (batal || !grup) return;

      const role = grup.group_name.toLowerCase();
      setPeran(grup.group_name);

      if (role === 'ladies') {
        const { data } = await supabase
          .from('ladies')
          .select('nama_ladies')
          .eq('id', user.ladies_id)
          .single();
        if (!batal) setNamaUser(data?.nama_ladies || user.nama || 'User');
      } else if (role === 'pengawas') {
        const { data } = await supabase
          .from('pengawas')
          .select('nama_panggilan')
          .eq('id', user.pengawas_id)
          .single();
        if (!batal) setNamaUser(data?.nama_panggilan || user.nama || 'User');
      } else if (!batal) {
        setNamaUser(user.nama || 'User');
      }
    };

    ambil();
    return () => {
      batal = true;
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppShell
      isLadies={isLadies}
      namaUser={namaUser}
      peran={peran}
      onLogout={handleLogout}
    >
      {children}
    </AppShell>
  );
}

export default MainLayout;
