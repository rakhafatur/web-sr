import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { RootState } from '../app/store';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const FIVE_MINUTES = 5 * 60 * 1000;

/**
 * Jaring pengaman kalau akun user dinonaktifkan admin SAAT dia masih login
 * di device lain — tanpa ini, sesi lama tetap jalan terus dan semua query
 * cuma diam-diam balik kosong, user tidak pernah tahu akunnya sudah tidak
 * berlaku. Dicek ulang saat app kembali fokus (refetchOnWindowFocus bawaan
 * React Query) dan tiap 5 menit sebagai cadangan — bukan tiap pindah
 * halaman, supaya tidak menambah latensi ke navigasi biasa.
 */
const SessionGuard = () => {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const userId = currentUser?.id;

  const { data, isSuccess } = useQuery({
    queryKey: ['session-check', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('is_active')
        .eq('id', userId as string)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    refetchInterval: FIVE_MINUTES,
    meta: { errorLabel: 'status akun' },
  });

  useEffect(() => {
    if (!userId || !isSuccess) return;

    const stillValid = !!data?.is_active;

    if (!stillValid) {
      logout();
      toast.error('Akunmu sudah tidak aktif. Silakan hubungi admin.');
      navigate('/login', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isSuccess, userId]);

  return null;
};

export default SessionGuard;
